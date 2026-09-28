(() => {
  'use strict';
  function sliceCanvas(canvas) {
    const height = Math.round(canvas.width * 297 / 210), margin = Math.round(canvas.width * 0.02), capacity = height - margin * 2, pages = [];
    // Use blank horizontal rows near a page boundary where possible to avoid cutting text.
    const context = canvas.getContext('2d', { willReadFrequently: true });
    for (let top = 0; top < canvas.height;) {
      let bottom = Math.min(top + capacity, canvas.height);
      if (canvas.height - bottom <= 2) bottom = canvas.height;
      if (bottom < canvas.height) {
        const band = context.getImageData(0, Math.max(top, bottom - 180), canvas.width, 180);
        for (let row = 179; row >= 0; row--) {
          let dark = 0;
          for (let x = 100; x < canvas.width - 100; x += 3) { const at = (row * canvas.width + x) * 4; if (band.data[at] < 170 && band.data[at+1] < 170 && band.data[at+2] < 170) dark++; }
          if (dark < 3) { bottom -= 179 - row; break; }
        }
      }
      const page = document.createElement('canvas'); page.width = canvas.width; page.height = height;
      const target = page.getContext('2d'); target.fillStyle = '#fffefc'; target.fillRect(0,0,page.width,page.height);
      target.drawImage(canvas,0,top,canvas.width,bottom-top,0,margin,canvas.width,Math.min(capacity,bottom-top)); pages.push(page); top = bottom;
    }
    return pages;
  }
  function pdfFromCanvas(canvas) {
    const pages = sliceCanvas(canvas), chunks = [], offsets = [0], encoder = new TextEncoder(); let length = 0;
    const bytes = data => { chunks.push(data); length += data.length; };
    const text = data => bytes(encoder.encode(data));
    const start = n => { offsets[n] = length; text(`${n} 0 obj\n`); };
    const end = () => text('\nendobj\n');
    text('%PDF-1.4\n%SJSC\n'); start(1); text('<< /Type /Catalog /Pages 2 0 R >>'); end();
    start(2); text(`<< /Type /Pages /Kids [${pages.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] /Count ${pages.length} >>`); end();
    pages.forEach((page,i) => {
      const n = 3+i*3, raw = atob(page.toDataURL('image/jpeg',0.95).split(',')[1]);
      const jpg = Uint8Array.from(raw, c=>c.charCodeAt(0));
      start(n); text(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${n+1} 0 R >> >> /Contents ${n+2} 0 R >>`); end();
      start(n+1); text(`<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`); bytes(jpg); text('\nendstream'); end();
      const content='q\n595.28 0 0 841.89 0 0 cm\n/Im0 Do\nQ\n'; start(n+2); text(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream`); end();
    });
    const xref = length; text(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
    offsets.slice(1).forEach(offset=>text(String(offset).padStart(10,'0')+' 00000 n \n'));
    text(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks,{type:'application/pdf'});
  }
  window.SJSCExport = Object.freeze({ sliceCanvas, pdfFromCanvas });
})();
