from pathlib import Path
import re

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# 1) Stock cards: two cards on the first row, redeemable card full width beneath them.
css = r'''
/* share-card-layout-20260905 */
.shareGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
.shareGrid>.stype:nth-child(3){grid-column:1/-1}
@media(max-width:760px){.shareGrid{grid-template-columns:1fr}.shareGrid>.stype:nth-child(3){grid-column:auto}}
'''
if '/* share-card-layout-20260905 */' not in s:
    s = s.replace('</style>', css + '\n</style>', 1)

# 2) Replace visible Arabic currency word with the Saudi Riyal symbol.
# Work only on text outside tags and outside script/style blocks to avoid changing JS/CSS source.
parts = re.split(r'(<script\b.*?</script>|<style\b.*?</style>)', s, flags=re.S|re.I)

def money_markup(num):
    return f'<span class="money"><span class="sar">&#xea;</span><span>{num}</span></span>'

def replace_text_segment(segment):
    chunks = re.split(r'(<[^>]+>)', segment)
    for i in range(0, len(chunks), 2):
        t = chunks[i]
        # Numeric amount immediately followed by ريال / ريالات / ريال سعودي.
        t = re.sub(r'(?<![\w>])([0-9][0-9,]*(?:\.[0-9]+)?)\s+(?:ريالات|ريال(?:\s+سعودي)?)', lambda m: money_markup(m.group(1)), t)
        # Spelled-out occurrences remaining in visible prose.
        t = t.replace('ريالات', '<span class="sar">&#xea;</span>')
        t = t.replace('ريال سعودي', '<span class="sar">&#xea;</span>')
        t = t.replace('ريال', '<span class="sar">&#xea;</span>')
        chunks[i] = t
    return ''.join(chunks)

for i in range(0, len(parts), 2):
    parts[i] = replace_text_segment(parts[i])
s = ''.join(parts)

p.write_text(s, encoding='utf-8')
print('share card layout refined and Riyal symbol applied to visible text')
