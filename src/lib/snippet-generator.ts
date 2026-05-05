import { FIELD_TYPES } from "@/config/field-types";

interface FormField {
    label: string;
    type: string;
    required: boolean;
    options?: string;
    reference?: {
        collection: string;
        displayField?: string;
    };
}

export function generateSnippets(formId: string, name: string, fields: FormField[], appUrl: string, connectorUrl: string) {
    const embedUrl = `${appUrl}/api/public/submit/${formId}`;

    const renderEmbedField = (f: FormField) => {
        const conf = FIELD_TYPES[f.type] || FIELD_TYPES.text;

        if (conf.category === 'Media' && (f.type === 'image' || f.type === 'image_array')) {
            const isMultiple = f.type === 'image_array';
            return `  <div class="field-group">
    <label>${f.label}${f.required ? ' *' : ''}</label>
    <input type="file" name="${f.label}" accept="image/*" ${isMultiple ? 'multiple ' : ''}${f.required ? 'required' : ''} />
    <${isMultiple ? 'div' : 'img'} id="preview-${f.label}" style="display:${isMultiple ? 'flex' : 'none'};${isMultiple ? 'gap:8px;flex-wrap:wrap;' : 'max-width:200px;'}margin-top:8px;${isMultiple ? '' : 'border-radius:6px;'}"${isMultiple ? '' : ' alt="preview"'}></${isMultiple ? 'div' : 'img'}>
  </div>`;
        }
        if (conf.category === 'Boolean') {
            return `  <div class="field-group" style="display:flex;align-items:center;gap:8px;">
    <input type="checkbox" name="${f.label}" id="${f.label}" ${f.required ? 'required' : ''} />
    <label for="${f.label}">${f.label}${f.required ? ' *' : ''}</label>
  </div>`;
        }
        if (conf.category === 'Selection' && f.type === 'enum') {
            const options = String(f.options || "").split(',').map(o => o.trim()).filter(Boolean);
            return `  <div class="field-group">
    <label>${f.label}${f.required ? ' *' : ''}</label>
    <select name="${f.label}" ${f.required ? 'required' : ''}>
      <option value="">Select an option</option>
${options.map(o => `      <option value="${o}">${o}</option>`).join('\n')}
    </select>
  </div>`;
        }

        const isTextarea = conf.component === 'TextareaInput' || conf.component === 'JsonEditor';
        let inputType = 'text';
        if (f.type === 'email') inputType = 'email';
        else if (conf.category === 'Numeric') inputType = 'number';
        else if (conf.category === 'Temporal') inputType = 'datetime-local';

        let step = '';
        if (f.type === 'number') step = ' step="1"';
        if (f.type === 'decimal') step = ' step="any"';

        if (f.type === 'uuid' || f.type === 'foreign_key' || f.type === 'reference') {
          return `  <div class="field-group">
    <label>${f.label}${f.required ? ' *' : ''}</label>
    <select name="${f.label}" ${f.required ? 'required' : ''} data-pp-reference="${f.reference?.collection || ''}" data-pp-display="${f.reference?.displayField || 'name'}">
      <option value="">Select ${f.label.toLowerCase()}...</option>
    </select>
  </div>`;
        }

        return `  <div class="field-group">
    <label>${f.label}${f.required ? ' *' : ''}${f.type === 'list' || f.type === 'array' ? ' (comma-separated)' : ''}</label>
    <${isTextarea ? 'textarea' : `input type="${inputType}"${step}`} name="${f.label}" ${f.required ? 'required' : ''}></${isTextarea ? 'textarea' : 'input'}>
  </div>`;
    };

    const hasImageFields = fields.some(f => f.type === 'image' || f.type === 'image_array');
    const referenceFields = fields.filter(f => f.type === 'uuid' || f.type === 'foreign_key' || f.type === 'reference');
    const hasReferenceFields = referenceFields.length > 0;

    const referenceFetchScript = hasReferenceFields ? `
<script>
  (function() {
    var selects = document.querySelectorAll('select[data-pp-reference]');
    selects.forEach(function(sel) {
      var col = sel.getAttribute('data-pp-reference');
      var display = sel.getAttribute('data-pp-display');
      if (!col) return;
      fetch('${appUrl}/api/public/references/' + col)
        .then(function(r) { return r.json(); })
        .then(function(res) {
          var dataArr = res.data || res;
          if (!dataArr || !Array.isArray(dataArr)) return;
          dataArr.forEach(function(item) {
            var opt = document.createElement('option');
            opt.value = item._id || item.id || item.submissionId;
            opt.textContent = item.data ? (item.data[display] || item.data.name || 'Unnamed') : (item[display] || item.name || 'Unnamed');
            sel.appendChild(opt);
          });
        })
        .catch(function(e) { console.error('Reference fetch failed:', e); });
    });
  })();
</script>` : '';

    const imageUploadScript = (hasImageFields || hasReferenceFields) ? `
<script>
  document.getElementById('pp-form').addEventListener('submit', async function(e) {
    if (this.getAttribute('method') === 'POST' && !this.id) return; // skip if simple POST
    e.preventDefault();
    var btn = document.getElementById('pp-submit-btn');
    btn.disabled = true; btn.textContent = 'Processing...';
    var data = {}; var errors = [];
    var uploads = Array.from(this.querySelectorAll('input,textarea,select')).map(async function(input) {
      if (!input.name) return;
      if (input.type === 'file' && input.files && input.files.length > 0) {
        try {
          var uploadedUrls = [];
          for (var i = 0; i < input.files.length; i++) {
            var fileInfo = input.files[i];
            var compressed = fileInfo;
            if (fileInfo.type.startsWith('image/')) {
              compressed = await new Promise(function(resolve) {
                var reader = new FileReader();
                reader.onload = function(e) {
                  var img = new Image();
                  img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var w = img.width, h = img.height, max = 1000;
                    if (w > max) { h = Math.round((h * max) / w); w = max; }
                    canvas.width = w; canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(fileInfo);
                    ctx.drawImage(img, 0, 0, w, h);
                    canvas.toBlob(function(b) {
                      if (b) resolve(new File([b], fileInfo.name, {type: 'image/jpeg'}));
                      else resolve(fileInfo);
                    }, 'image/jpeg', 0.8);
                  };
                  img.onerror = function() { resolve(fileInfo); };
                  img.src = e.target.result;
                };
                reader.onerror = function() { resolve(fileInfo); };
                reader.readAsDataURL(fileInfo);
              });
            }
            var fd = new FormData(); fd.append('file', compressed);
            var r = await fetch('${connectorUrl}/postpipe/upload', { method: 'POST', body: fd });
            var d = await r.json();
            if (!r.ok || !d.url) throw new Error(d.error || 'Upload failed');
            uploadedUrls.push(d.url);
          }
          if (input.multiple) { data[input.name] = uploadedUrls; } else { data[input.name] = uploadedUrls[0]; }
        } catch(e) { errors.push(input.name + ': ' + e.message); }
      } else if (input.type !== 'submit') { 
        if (input.type === 'checkbox') data[input.name] = input.checked;
        else data[input.name] = input.value; 
      }
    });
    await Promise.all(uploads);
    if (errors.length) { alert('Upload failed:\\n' + errors.join('\\n')); btn.disabled=false; btn.textContent='Submit Form'; return; }
    btn.textContent = 'Submitting...';
    try {
      var res = await fetch('${embedUrl}', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
      if (res.ok) { btn.textContent='✓ Submitted!'; document.getElementById('pp-form').reset(); document.querySelectorAll('[id^="preview-"]').forEach(function(el){if(el.tagName.toLowerCase()==='img'){el.src='';el.style.display='none';}else{el.innerHTML='';}}); }
      else { var err=await res.json(); alert('Submission failed: '+(err.error||res.statusText)); btn.disabled=false; btn.textContent='Submit Form'; }
    } catch(e) { alert('Network error: '+e.message); btn.disabled=false; btn.textContent='Submit Form'; }
  });
  document.querySelectorAll('input[type="file"]').forEach(function(input) {
    input.addEventListener('change', function() {
      var p = document.getElementById('preview-'+input.name);
      if (p && input.files && input.files.length > 0) {
        if (p.tagName.toLowerCase() === 'img') {
          p.src = URL.createObjectURL(input.files[0]); p.style.display = 'block';
        } else {
          p.innerHTML = '';
          for (var i = 0; i < input.files.length; i++) {
            var img = document.createElement('img');
            img.src = URL.createObjectURL(input.files[i]);
            img.style.maxWidth = '100px';
            img.style.borderRadius = '6px';
            p.appendChild(img);
          }
        }
      }
    });
  });
</script>` : '';

    const html = `<!-- Postpipe Cosmic Embed -->
<form id="pp-form" action="${embedUrl}" method="POST" class="postpipe-form">
${fields.map(renderEmbedField).join('\n')}
  <button type="submit" id="pp-submit-btn" class="submit-btn">Submit Form</button>
</form>${imageUploadScript}${referenceFetchScript}`;

    const react = `import { useState } from 'react';

export default function MyPostpipeForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch('${embedUrl}', {
        method: 'POST',
        body: formData
      });
      if (res.ok) alert('Success!');
      else alert('Error: ' + res.statusText);
    } catch(err) {
      console.error(err);
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
${fields.map(f => {
        const conf = FIELD_TYPES[f.type] || FIELD_TYPES.text;
        if (conf.category === 'Boolean') {
            return `      <div className="flex items-center gap-2">
        <input type="checkbox" name="${f.label}" id="${f.label}" ${f.required ? 'required' : ''} />
        <label htmlFor="${f.label}">${f.label}</label>
      </div>`;
        }
        if (conf.category === 'Selection' && f.type === 'enum') {
            const opts = String(f.options || "").split(',').map(o => o.trim()).filter(Boolean);
            return `      <div>
        <label>${f.label}</label>
        <select name="${f.label}" ${f.required ? 'required' : ''} className="border p-2 w-full rounded">
          <option value="">Select...</option>
${opts.map(o => `          <option value="${o}">${o}</option>`).join('\n')}
        </select>
      </div>`;
        }
        const isTa = conf.component === 'TextareaInput' || conf.component === 'JsonEditor';
        let inputType = 'text';
        if (f.type === 'email') inputType = 'email';
        else if (conf.category === 'Numeric') inputType = 'number';
        else if (conf.category === 'Temporal') inputType = 'datetime-local';

        let stepAttr = '';
        if (f.type === 'number') stepAttr = ' step="1"';
        if (f.type === 'decimal') stepAttr = ' step="any"';

        const placeholderAttr = f.type === 'uuid' ? ' placeholder="UUID"' : (f.type === 'foreign_key' || f.type === 'fk' ? ' placeholder="Reference ID"' : '');

        return `      <div>
        <label>${f.label}</label>
        <${isTa ? 'textarea' : 'input type="' + inputType + '"' + stepAttr + placeholderAttr} name="${f.label}" ${f.required ? 'required' : ''} className="border p-2 w-full rounded" />
      </div>`;
    }).join('\n')}
      <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded">
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}`;

    return { html, react };
}

export function generateAuthSnippet(preset: any, appUrl: string) {
    const providers = [
        preset.providers?.email && '"email"',
        preset.providers?.google && '"google"',
        preset.providers?.github && '"github"',
    ].filter(Boolean).join(', ');

    const html = `<!-- Place this where you want the Postpipe Auth UI to render -->
<div id="postpipe-auth"></div>

<!-- Include the Postpipe Auth CDN script -->
<script src="${appUrl}/api/public/cdn/auth.js?projectId=${preset.projectId || ''}"></script>

<!-- Initialize Postpipe Auth -->
<script>
    PostpipeAuth.init({
        apiUrl: "${preset.apiUrl || ''}",
        projectId: "${preset.projectId || ''}",
        providers: [${providers}],
        redirectUrl: ${(!preset.redirectUrl || preset.redirectUrl === 'window.location.origin') ? 'window.location.origin' : `"${preset.redirectUrl}"`}${preset.targetDatabase && preset.targetDatabase !== 'default' ? `,\n        targetDatabase: "${preset.targetDatabase}"` : ''}
    });

    PostpipeAuth.on("success", (user) => {
        console.log("Authenticated User:", user);
    });

    PostpipeAuth.on("error", (error) => {
        console.error("Authentication Error:", error);
    });
</script>`;

    // For now, React snippet is just a wrapper for the HTML/Script approach or similar
    const react = `import { useEffect } from 'react';

export default function PostpipeAuth() {
  useEffect(() => {
    // Load script dynamically
    const script = document.createElement('script');
    script.src = "${appUrl}/api/public/cdn/auth.js?projectId=${preset.projectId || ''}";
    script.async = true;
    script.onload = () => {
      if (window.PostpipeAuth) {
        window.PostpipeAuth.init({
          apiUrl: "${preset.apiUrl || ''}",
          projectId: "${preset.projectId || ''}",
          providers: [${providers}],
          redirectUrl: ${(!preset.redirectUrl || preset.redirectUrl === 'window.location.origin') ? 'window.location.origin' : `"${preset.redirectUrl}"`}${preset.targetDatabase && preset.targetDatabase !== 'default' ? `,\n          targetDatabase: "${preset.targetDatabase}"` : ''}
        });

        window.PostpipeAuth.on("success", (user) => {
          console.log("Authenticated User:", user);
        });
      }
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="postpipe-auth"></div>;
}`;

    return { html, react };
}

