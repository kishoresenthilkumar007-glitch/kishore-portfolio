import py_compile
try:
    with open('script.js', 'r') as f:
        js = f.read()
except Exception:
    pass
