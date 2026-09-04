from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Remove the quick-view button from the sticky navigation.
s = s.replace('<button class="quickViewBtn" id="quickViewBtn" type="button" aria-pressed="false">عرض سريع · 3 دقائق</button>', '')

# Remove quick-view-only CSS.
s = re.sub(r'\.quickViewBtn\{[^}]*\}\.quickViewBtn\[aria-pressed="true"\]\{[^}]*\}', '', s)
s = re.sub(r'body\.quickMode \.deepCompare.*?body\.quickMode #calculator \.results\{max-width:900px;margin:auto\}', '', s)
s = s.replace('.quickViewBtn{display:none}', '')
s = s.replace('body.quickMode .shareCalc{display:grid!important}body.quickMode #calculator .controls{display:block!important}', '')

# Remove quick-view JavaScript and its explanatory comment.
s = re.sub(
    r'// Quick 3-minute view: keep the main logic, diagrams and results; hide deep detail\.\nif\(\$\(\'quickViewBtn\'\)\).*?\n\n',
    '',
    s,
    count=1,
    flags=re.S,
)

# Safety checks: the idea is fully removed from the rendered page.
for token in ('quickViewBtn', 'quickMode', 'عرض سريع · 3 دقائق'):
    if token in s:
        raise SystemExit(f'quick view token still present: {token}')

p.write_text(s, encoding='utf-8')
print('quick view removed completely')
