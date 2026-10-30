using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using System.Collections.Generic;

namespace MDSyncDesktop
{
    static class Program
    {
        private static HttpListener _listener;
        private static string _distPath;
        private static bool _running = true;

        private static readonly Dictionary<string, string> MimeTypes = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { ".html", "text/html; charset=utf-8" },
            { ".htm", "text/html; charset=utf-8" },
            { ".js", "application/javascript; charset=utf-8" },
            { ".mjs", "application/javascript; charset=utf-8" },
            { ".css", "text/css; charset=utf-8" },
            { ".json", "application/json; charset=utf-8" },
            { ".png", "image/png" },
            { ".jpg", "image/jpeg" },
            { ".jpeg", "image/jpeg" },
            { ".gif", "image/gif" },
            { ".svg", "image/svg+xml" },
            { ".ico", "image/x-icon" },
            { ".woff", "font/woff" },
            { ".woff2", "font/woff2" },
            { ".ttf", "font/ttf" },
            { ".eot", "application/vnd.ms-fontobject" },
            { ".apk", "application/vnd.android.package-archive" }
        };

        [STAThread]
        static void Main()
        {
            try
            {
                // Localizar pasta dist
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                _distPath = Path.Combine(baseDir, "dist");
                if (!Directory.Exists(_distPath))
                {
                    _distPath = Path.Combine(Directory.GetCurrentDirectory(), "dist");
                }

                if (!Directory.Exists(_distPath))
                {
                    // Tentar caminho do projeto de desenvolvimento
                    string devPath = @"C:\Users\maycon.nascimento\Documents\antigravity\mdsync-geotecnia\dist";
                    if (Directory.Exists(devPath))
                    {
                        _distPath = devPath;
                    }
                }

                int port = GetAvailablePort();
                string url = "http://127.0.0.1:" + port + "/";

                // Iniciar servidor HTTP local para servir os arquivos do site
                _listener = new HttpListener();
                _listener.Prefixes.Add(url);
                _listener.Start();

                Thread serverThread = new Thread(ListenLoop) { IsBackground = true };
                serverThread.Start();

                // Iniciar navegador em modo Aplicativo de Desktop (App Mode)
                Process browserProcess = LaunchAppWindow(url);

                if (browserProcess != null)
                {
                    browserProcess.WaitForExit();
                }
                else
                {
                    // Se não tiver Edge/Chrome, abrir no navegador padrão
                    Process.Start(url);
                    // Manter aberto enquanto o usuário navega
                    Thread.Sleep(3000);
                }
            }
            catch (Exception ex)
            {
                // Fallback para online se servidor local falhar
                Process.Start("https://maycon97.github.io/MDSync---Mining-Geotechnical-Data/");
            }
            finally
            {
                _running = false;
                if (_listener != null)
                {
                    try { _listener.Stop(); } catch { }
                }
            }
        }

        private static int GetAvailablePort()
        {
            TcpListener l = new TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        private static void ListenLoop()
        {
            while (_running && _listener.IsListening)
            {
                try
                {
                    var context = _listener.GetContext();
                    ThreadPool.QueueUserWorkItem((c) => HandleRequest((HttpListenerContext)c), context);
                }
                catch
                {
                    if (!_running) break;
                }
            }
        }

        private static void HandleRequest(HttpListenerContext context)
        {
            try
            {
                string rawUrl = context.Request.Url.AbsolutePath.TrimStart('/');
                if (string.IsNullOrEmpty(rawUrl)) rawUrl = "index.html";

                string filePath = Path.Combine(_distPath, rawUrl.Replace('/', Path.DirectorySeparatorChar));

                // SPA Fallback: se o arquivo não existir ou for uma rota interna, servir index.html
                if (!File.Exists(filePath))
                {
                    filePath = Path.Combine(_distPath, "index.html");
                }

                if (File.Exists(filePath))
                {
                    string ext = Path.GetExtension(filePath);
                    string mime;
                    if (!MimeTypes.TryGetValue(ext, out mime))
                    {
                        mime = "application/octet-stream";
                    }

                    byte[] buffer = File.ReadAllBytes(filePath);
                    context.Response.ContentType = mime;
                    context.Response.ContentLength64 = buffer.Length;
                    context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                    context.Response.OutputStream.Write(buffer, 0, buffer.Length);
                }
                else
                {
                    context.Response.StatusCode = 404;
                }
            }
            catch
            {
                context.Response.StatusCode = 500;
            }
            finally
            {
                try { context.Response.Close(); } catch { }
            }
        }

        private static Process LaunchAppWindow(string url)
        {
            string profileDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MDSyncDesktopProfile");

            string[] candidates = new string[]
            {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe")
            };

            foreach (var path in candidates)
            {
                if (File.Exists(path))
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = path,
                        Arguments = string.Format("--app=\"{0}\" --window-size=1366,850 --user-data-dir=\"{1}\" --no-first-run", url, profileDir),
                        UseShellExecute = false
                    };
                    return Process.Start(psi);
                }
            }

            return null;
        }
    }
}
