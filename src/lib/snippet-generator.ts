import { FIELD_TYPES } from "@/config/field-types";

interface FormField {
    name?: string;
    label?: string;
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
        const safeLabel = f.name || f.label || f.type || 'field';

        if (conf.category === 'Media' && (f.type === 'image' || f.type === 'image_array')) {
            const isMultiple = f.type === 'image_array';
            return `  <div class="field-group">
    <label>${safeLabel}${f.required ? ' *' : ''}</label>
    <input type="file" name="${safeLabel}" accept="image/*" ${isMultiple ? 'multiple ' : ''}${f.required ? 'required' : ''} />
    <${isMultiple ? 'div' : 'img'} id="preview-${safeLabel}" style="display:${isMultiple ? 'flex' : 'none'};${isMultiple ? 'gap:8px;flex-wrap:wrap;' : 'max-width:200px;'}margin-top:8px;${isMultiple ? '' : 'border-radius:6px;'}"${isMultiple ? '' : ' alt="preview"'}></${isMultiple ? 'div' : 'img'}>
  </div>`;
        }
        if (conf.category === 'Boolean') {
            return `  <div class="field-group" style="display:flex;align-items:center;gap:8px;">
    <input type="checkbox" name="${safeLabel}" id="${safeLabel}" ${f.required ? 'required' : ''} />
    <label for="${safeLabel}">${safeLabel}${f.required ? ' *' : ''}</label>
  </div>`;
        }
        if (conf.category === 'Selection' && f.type === 'enum') {
            const options = String(f.options || "").split(',').map(o => o.trim()).filter(Boolean);
            return `  <div class="field-group">
    <label>${safeLabel}${f.required ? ' *' : ''}</label>
    <select name="${safeLabel}" ${f.required ? 'required' : ''}>
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
    <label>${safeLabel}${f.required ? ' *' : ''}</label>
    <select name="${safeLabel}" ${f.required ? 'required' : ''} data-pp-reference="${f.reference?.collection || ''}" data-pp-display="${f.reference?.displayField || 'name'}">
      <option value="">Select ${safeLabel.toLowerCase()}...</option>
    </select>
  </div>`;
        }

        return `  <div class="field-group">
    <label>${safeLabel}${f.required ? ' *' : ''}${f.type === 'list' || f.type === 'array' ? ' (comma-separated)' : ''}</label>
    <${isTextarea ? 'textarea' : `input type="${inputType}"${step}`} name="${safeLabel}" ${f.required ? 'required' : ''}></${isTextarea ? 'textarea' : 'input'}>
  </div>`;
    };

    const hasImageFields = fields.some(f => FIELD_TYPES[f.type]?.category === 'Media' && (f.type === 'image' || f.type === 'image_array'));
    const hasReferenceFields = fields.some(f => f.type === 'uuid' || f.type === 'foreign_key' || f.type === 'reference');
    const hasBooleanFields = fields.some(f => FIELD_TYPES[f.type]?.category === 'Boolean');

    const referenceScript = hasReferenceFields ? `
<script>
  (function() {
    var form = document.getElementById('pp-form-${formId}');
    if (!form) return;
    var selects = form.querySelectorAll('select[data-pp-reference]');
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

    const formSubmitScript = `
<script>
  (function() {
    var form = document.getElementById('pp-form-${formId}');
    if (!form) return;
    var successBox = document.getElementById('pp-success-${formId}');
    var errorBox = document.getElementById('pp-error-${formId}');

    // 1. Detect if page loaded with ?success=true (from native HTML form redirect)
    var urlParams = new URLSearchParams(window.location.search);
    if ((urlParams.get('success') || '').toLowerCase() === 'true') {
      if (successBox) successBox.style.display = 'block';
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var originalBtnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Submitting...';
      if (errorBox) errorBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';

      var data = {};
      var errors = [];
      var inputs = Array.from(form.querySelectorAll('input,textarea,select'));

      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        if (!input.name || input.type === 'submit') continue;

        if (input.type === 'file' && input.files && input.files.length > 0) {
          try {
            var uploadedUrls = [];
            for (var j = 0; j < input.files.length; j++) {
              var fileInfo = input.files[j];
              var fd = new FormData();
              fd.append('file', fileInfo);
              var r = await fetch('${connectorUrl}/postpipe/upload', { method: 'POST', body: fd });
              var d = await r.json().catch(function() { return {}; });
              if (!r.ok || !d.url) throw new Error(d.error || 'Upload failed');
              uploadedUrls.push(d.url);
            }
            data[input.name] = input.multiple ? uploadedUrls : uploadedUrls[0];
          } catch(err) {
            errors.push(input.name + ': ' + (err.message || 'Upload error'));
          }
        } else if (input.type === 'checkbox') {
          data[input.name] = input.checked;
        } else {
          data[input.name] = input.value;
        }
      }

      if (errors.length) {
        if (errorBox) {
          errorBox.textContent = 'Upload error: ' + errors.join(', ');
          errorBox.style.display = 'block';
        } else {
          alert('Upload failed:\\n' + errors.join('\\n'));
        }
        btn.disabled = false;
        btn.textContent = originalBtnText;
        return;
      }

      try {
        var res = await fetch('${embedUrl}', {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        var resData = await res.json().catch(function() { return null; });

        if (res.ok && (!resData || resData.success !== false)) {
          btn.textContent = '✓ Submitted!';
          form.reset();
          if (successBox) successBox.style.display = 'block';
          form.querySelectorAll('[id^="preview-"]').forEach(function(el) {
            if (el.tagName.toLowerCase() === 'img') { el.src = ''; el.style.display = 'none'; }
            else { el.innerHTML = ''; }
          });
          setTimeout(function() {
            btn.textContent = originalBtnText;
            btn.disabled = false;
          }, 3000);
        } else {
          var errMsg = (resData && (resData.error || resData.message)) || res.statusText || 'Submission failed';
          if (errorBox) {
            errorBox.textContent = 'Error: ' + errMsg;
            errorBox.style.display = 'block';
          } else {
            alert('Submission failed: ' + errMsg);
          }
          btn.disabled = false;
          btn.textContent = originalBtnText;
        }
      } catch(err) {
        var netMsg = err.message || 'Network error occurred';
        if (errorBox) {
          errorBox.textContent = 'Error: ' + netMsg;
          errorBox.style.display = 'block';
        } else {
          alert('Error: ' + netMsg);
        }
        btn.disabled = false;
        btn.textContent = originalBtnText;
      }
    });

    // File preview bindings
    form.querySelectorAll('input[type="file"]').forEach(function(input) {
      input.addEventListener('change', function() {
        var p = document.getElementById('preview-' + input.name);
        if (p && input.files && input.files.length > 0) {
          if (p.tagName.toLowerCase() === 'img') {
            p.src = URL.createObjectURL(input.files[0]);
            p.style.display = 'block';
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
  })();
</script>`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; background: #fafafa; }
    .pp-container { max-width: 500px; margin: 0 auto; }
    #pp-form-${formId} { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .field-group { margin-bottom: 16px; }
    label { display: block; margin-bottom: 6px; font-weight: 500; font-size: 14px; color: #374151; }
    input[type="text"], input[type="email"], input[type="number"], input[type="datetime-local"], select, textarea { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px #6366f1; }
    textarea { min-height: 100px; resize: vertical; }
    button[type="submit"] { background: #4f46e5; color: white; border: none; padding: 10px 16px; border-radius: 6px; font-weight: 500; cursor: pointer; width: 100%; transition: background 0.2s; }
    button[type="submit"]:hover { background: #4338ca; }
    button[type="submit"]:disabled { opacity: 0.7; cursor: not-allowed; }
    .pp-alert-success { text-align: center; padding: 24px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 16px; }
    .pp-alert-error { padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 16px; color: #b91c1c; font-size: 13px; }
  </style>
</head>
<body>
  <div class="pp-container">
    <div id="pp-success-${formId}" class="pp-alert-success" style="display:none;">
      <div style="font-size:32px; color:#16a34a; margin-bottom:8px;">✓</div>
      <h3 style="margin:0 0 6px; font-size:16px; font-weight:600; color:#15803d;">Thank you!</h3>
      <p style="margin:0; font-size:13px; color:#166534;">Your submission has been received successfully.</p>
    </div>
    <div id="pp-error-${formId}" class="pp-alert-error" style="display:none;"></div>

    <form id="pp-form-${formId}" action="${embedUrl}" method="POST">
      <h2 style="margin-top:0;margin-bottom:20px;font-size:18px;color:#111827;">${name}</h2>
${fields.map(renderEmbedField).join('\n')}
      <button type="submit">Submit Form</button>
    </form>
  </div>
${referenceScript}
${formSubmitScript}
</body>
</html>
`.trim();

    const react = `import { useState } from 'react';

export default function MyPostpipeForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const res = await fetch('${embedUrl}', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      
      const data = await res.json().catch(() => null);
      if (res.ok && (!data || data.success !== false)) {
        setSuccess(true);
        form.reset();
      } else {
        setError(data?.error || res.statusText || 'Submission failed');
      }
    } catch(err) {
      setError(err?.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 text-center bg-emerald-500/10 border border-emerald-500/30 rounded-xl max-w-md mx-auto">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">✓</div>
        <h3 className="text-lg font-semibold text-emerald-400 mb-1">Thank you!</h3>
        <p className="text-sm text-neutral-300 mb-4">Your submission has been received successfully.</p>
        <button 
          type="button"
          onClick={() => setSuccess(false)}
          className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
      {error && (
        <div className="p-3 text-sm bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
          {error}
        </div>
      )}
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

