import http.server
import os

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.path.split('?')[0]
        if path != '/' and '.' not in os.path.basename(path):
            html_path = path + '.html'
            full_path = os.path.join(os.getcwd(), html_path.lstrip('/'))
            if os.path.isfile(full_path):
                self.path = html_path
        super().do_GET()

if __name__ == '__main__':
    os.chdir('/Users/nayar/Desktop/Apex')
    server = http.server.HTTPServer(('', 8080), CleanURLHandler)
    print('Server running on http://localhost:8080')
    server.serve_forever()
