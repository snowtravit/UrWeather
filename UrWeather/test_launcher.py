import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest


class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="urweather launcher ")
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name)
        shutil.copy(Path(__file__).with_name("start.py"), self.project / "start.py")
        (self.project / "package.json").write_text('{}', encoding="utf-8")
        (self.project / ".setup_complete").write_text('package_manager: npm\n', encoding="utf-8")
        self.vite = self.project / "node_modules" / "vite" / "bin" / "vite.js"
        self.vite.parent.mkdir(parents=True)

    def launch(self, port="5173"):
        env = dict(os.environ, PORT=port)
        return subprocess.run([sys.executable, str(self.project / "start.py")], env=env,
                              capture_output=True, text=True, timeout=10)

    def test_runs_node_directly_from_a_project_path_with_spaces(self):
        self.vite.write_text('console.log("launcher reached vite"); process.exit(0);', encoding="utf-8")
        result = self.launch()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("launcher reached vite", result.stdout)

    def test_propagates_the_server_failure_exit_status(self):
        self.vite.write_text('process.exit(7);', encoding="utf-8")
        self.assertEqual(self.launch().returncode, 7)

    def test_rejects_invalid_port(self):
        self.vite.write_text('process.exit(0);', encoding="utf-8")
        for port in ["oops", "0", "65536"]:
            with self.subTest(port=port):
                result = self.launch(port)
                self.assertEqual(result.returncode, 1)
                self.assertIn("PORT must be", result.stdout)

    def test_explains_a_missing_vite_installation(self):
        result = self.launch()
        self.assertEqual(result.returncode, 1)
        self.assertIn("Vite is not installed", result.stdout)


if __name__ == "__main__":
    unittest.main()
