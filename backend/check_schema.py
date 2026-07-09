import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from utils.db import get_db
conn = get_db()
with conn.cursor() as c:
    c.execute('SHOW TABLES')
    tables = [list(r.values())[0] for r in c.fetchall()]
    print('Tables:', tables)
    for t in tables:
        c.execute('DESCRIBE `%s`' % t)
        cols = [(r['Field'], r['Type']) for r in c.fetchall()]
        print(f'\n[{t}]')
        for col in cols:
            print(f'  {col[0]}: {col[1]}')
conn.close()
