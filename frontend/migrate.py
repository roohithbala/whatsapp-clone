import os
import re

css_dir = "e:/Whatsapp Clonw/whatsapp-clone/frontend/src/styles"
index_css_path = "e:/Whatsapp Clonw/whatsapp-clone/frontend/src/index.css"

all_css = []
for file in os.listdir(css_dir):
    if file.endswith(".css"):
        with open(os.path.join(css_dir, file), "r", encoding="utf-8") as f:
            all_css.append(f"/* From {file} */\n" + f.read())

combined_css = "\n\n".join(all_css)

# Create index.css with Tailwind import and theme
index_content = """@import "tailwindcss";

@theme {
  --color-whatsapp-green: #00a884;
  --color-whatsapp-light-green: #d9fdd3;
  --color-whatsapp-teal: #005c4b;
  --color-whatsapp-dark-green: #008f72;
  --color-whatsapp-blue: #53bdeb;
}

"""

# Read original index.css
with open(index_css_path, "r", encoding="utf-8") as f:
    orig_index = f.read()

with open(index_css_path, "w", encoding="utf-8") as f:
    f.write(index_content + orig_index + "\n\n@layer components {\n" + combined_css + "\n}\n")

# Remove all css files except index.css
import shutil
shutil.rmtree(css_dir)

# Now we need to remove the CSS imports from JSX files
jsx_dir = "e:/Whatsapp Clonw/whatsapp-clone/frontend/src"
for root, dirs, files in os.walk(jsx_dir):
    for file in files:
        if file.endswith((".jsx", ".js")):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Remove imports like import "./styles/Auth.css";
            new_content = re.sub(r'import\s+["\'].*?/styles/.*?\.css["\'];\n?', '', content)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
