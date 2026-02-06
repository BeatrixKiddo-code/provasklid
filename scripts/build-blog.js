const { Client } = require('@notionhq/client');
const { NotionToMarkdown } = require('notion-to-md');
const fs = require('fs');
const path = require('path');
const https = require('https');

const notion = new Client({ auth: process.env.NOTION_SECRET });
const databaseId = process.env.NOTION_DATABASE_ID;

const n2m = new NotionToMarkdown({ notionClient: notion });

const BLOG_DIR = path.join(__dirname, '../blog');
const IMAGES_DIR = path.join(BLOG_DIR, 'images');

if (!fs.existsSync(BLOG_DIR)) fs.mkdirSync(BLOG_DIR, { recursive: true });
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const filepath = path.join(IMAGES_DIR, filename);
        const file = fs.createWriteStream(filepath);

        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                https.get(response.headers.location, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(`images/${filename}`);
                    });
                });
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(`images/${filename}`);
                });
            }
        }).on('error', reject);
    });
}

function markdownToHtml(markdown) {
    let html = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" loading="lazy">')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

    const lines = html.split('\n\n');
    html = lines.map(line => {
        line = line.trim();
        if (!line) return '';
        if (line.startsWith('<h') || line.startsWith('<img') || line.startsWith('<ul') || line.startsWith('<ol')) {
            return line;
        }
        return `<p>${line.replace(/\n/g, '<br>')}</p>`;
    }).filter(line => line).join('\n');

    return html;
}

function articleTemplate(article, content) {
    return `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${article.excerpt || ''}">
    <title>${article.title} | Blog | Pro Váš Klid</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="blog.css">
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <a href="../index.html" class="logo">
                <img src="../images/logo.webp" alt="Pro Váš Klid" width="200" height="70">
            </a>
            <nav class="nav">
                <a href="../index.html#sluzby" class="nav-link">Služby</a>
                <a href="../index.html#reference" class="nav-link">Reference</a>
                <a href="../index.html#faq" class="nav-link">FAQ</a>
                <a href="index.html" class="nav-link">Blog</a>
                <a href="../index.html#kontakt" class="nav-link">Kontakt</a>
                <a href="../index.html#kontakt" class="cta-button small no-arrow">Objednat službu</a>
            </nav>
            <button class="nav-toggle" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <main class="blog-article">
        <div class="container">
            <a href="index.html" class="back-link">← Zpět na blog</a>
            
            <article class="article-content">
                ${article.cover ? `<img src="${article.cover}" alt="${article.title}" class="article-cover">` : ''}
                <header class="article-header">
                    <time datetime="${article.date}">${new Date(article.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                    <h1>${article.title}</h1>
                </header>
                
                <div class="article-body">
                    ${content}
                </div>
            </article>
        </div>
    </main>

    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-bottom">
                <p>&copy; 2026 Pro Váš Klid &nbsp;|&nbsp; Mělník - Mšeno - Neratovice - Byšice</p>
                <div class="footer-legal">
                    <a href="../ochrana-osobnich-udaju.html">Ochrana osobních údajů</a>
                    <span>|</span>
                    <a href="../podminky.html">Podmínky</a>
                    <span>|</span>
                    <span>Web vytvořila <a href="https://zjanacova.cz" target="_blank">zjanacova.cz</a></span>
                </div>
            </div>
        </div>
    </footer>

    <script>
        const navToggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                nav.classList.toggle('active');
            });
        }
    </script>
</body>
</html>`;
}

function blogIndexTemplate(articles) {
    const articleCards = articles.map(a => `
            <article class="blog-card">
                <a href="${a.slug}.html">
                    ${a.cover ? `<img src="${a.cover}" alt="${a.title}" class="blog-card-image">` : ''}
                    <div class="blog-card-content">
                        <time datetime="${a.date}">${new Date(a.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                        <h2>${a.title}</h2>
                        <p>${a.excerpt || ''}</p>
                        <span class="read-more">Číst více →</span>
                    </div>
                </a>
            </article>`).join('\n');

    return `<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Blog Pro Váš Klid - tipy a rady pro péči o domácnost, zahradu a zvířata.">
    <title>Blog | Pro Váš Klid</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="blog.css">
</head>
<body>
    <header class="header">
        <div class="container header-content">
            <a href="../index.html" class="logo">
                <img src="../images/logo.webp" alt="Pro Váš Klid" width="200" height="70">
            </a>
            <nav class="nav">
                <a href="../index.html#sluzby" class="nav-link">Služby</a>
                <a href="../index.html#reference" class="nav-link">Reference</a>
                <a href="../index.html#faq" class="nav-link">FAQ</a>
                <a href="index.html" class="nav-link active">Blog</a>
                <a href="../index.html#kontakt" class="nav-link">Kontakt</a>
                <a href="../index.html#kontakt" class="cta-button small no-arrow">Objednat službu</a>
            </nav>
            <button class="nav-toggle" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <main class="blog-list">
        <div class="container">
            <h1>Blog</h1>
            <p class="blog-intro">Tipy a rady pro péči o domácnost, zahradu a vaše mazlíčky.</p>
            
            <div class="blog-grid">
${articleCards}
            </div>
            
            ${articles.length === 0 ? '<p class="no-articles">Zatím zde nejsou žádné články.</p>' : ''}
        </div>
    </main>

    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-bottom">
                <p>&copy; 2026 Pro Váš Klid &nbsp;|&nbsp; Mělník - Mšeno - Neratovice - Byšice</p>
                <div class="footer-legal">
                    <a href="ochrana-osobnich-udaju.html">Ochrana osobních údajů</a>
                    <span>|</span>
                    <a href="podminky.html">Podmínky</a>
                    <span>|</span>
                    <span>Web vytvořila <a href="https://zjanacova.cz" target="_blank">zjanacova.cz</a></span>
                </div>
            </div>
        </div>
    </footer>

    <script>
        const navToggle = document.querySelector('.nav-toggle');
        const nav = document.querySelector('.nav');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                nav.classList.toggle('active');
            });
        }
    </script>
</body>
</html>`;
}

async function buildBlog() {
    console.log('Stahuji články z Notion...');

    const existingFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.html'));
    existingFiles.forEach(file => {
        fs.unlinkSync(path.join(BLOG_DIR, file));
        console.log(`Smazán starý soubor: ${file}`);
    });

    const today = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'Europe/Prague'
    }).format(new Date());

    console.log(`Dnešní datum (lokální): ${today}`);

    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                and: [
                    {
                        property: 'Published',
                        checkbox: { equals: true }
                    },
                    {
                        property: 'Publish Date',
                        date: { on_or_before: today }
                    }
                ]
            },
            sorts: [{ property: 'Date', direction: 'descending' }]
        });

        console.log(`Nalezeno ${response.results.length} článků:`);
        response.results.forEach(page => {
            const title = page.properties.Title?.title?.[0]?.plain_text;
            const publishDate = page.properties['Publish Date']?.date?.start;
            console.log(`  - ${title}: Publish Date = ${publishDate}`);
        });

        const articles = [];

        for (const page of response.results) {
            const props = page.properties;

            const article = {
                id: page.id,
                title: props.Title?.title?.[0]?.plain_text || 'Bez názvu',
                slug: props.Slug?.rich_text?.[0]?.plain_text || page.id,
                date: props.Date?.date?.start || new Date().toISOString().split('T')[0],
                excerpt: props.Excerpt?.rich_text?.[0]?.plain_text || '',
                cover: null
            };

            if (props.Cover?.files?.[0]) {
                const coverFile = props.Cover.files[0];
                const coverUrl = coverFile.file?.url || coverFile.external?.url;
                if (coverUrl) {
                    const ext = coverUrl.includes('.png') ? 'png' : 'jpg';
                    const filename = `${article.slug}-cover.${ext}`;
                    try {
                        article.cover = await downloadImage(coverUrl, filename);
                        console.log(`  ✓ Cover stažen: ${filename}`);
                    } catch (e) {
                        console.log(`  ✗ Chyba při stahování coveru: ${e.message}`);
                    }
                }
            }

            const mdBlocks = await n2m.pageToMarkdown(page.id);
            let markdown = n2m.toMarkdownString(mdBlocks).parent;

            const imageRegex = /!\[(.*?)\]\((https:\/\/[^)]+)\)/g;
            let match;
            let imageIndex = 0;
            while ((match = imageRegex.exec(markdown)) !== null) {
                const [fullMatch, alt, url] = match;
                const ext = url.includes('.png') ? 'png' : 'jpg';
                const filename = `${article.slug}-${imageIndex++}.${ext}`;
                try {
                    const localPath = await downloadImage(url, filename);
                    markdown = markdown.replace(fullMatch, `![${alt}](${localPath})`);
                    console.log(`  ✓ Obrázek stažen: ${filename}`);
                } catch (e) {
                    console.log(`  ✗ Chyba při stahování obrázku: ${e.message}`);
                }
            }

            const htmlContent = markdownToHtml(markdown);

            const articleHtml = articleTemplate(article, htmlContent);
            fs.writeFileSync(path.join(BLOG_DIR, `${article.slug}.html`), articleHtml);
            console.log(`✓ Článek vygenerován: ${article.title}`);

            articles.push(article);
        }

        const indexHtml = blogIndexTemplate(articles);
        fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexHtml);
        console.log(`\n✓ Blog index vygenerován (${articles.length} článků)`);

    } catch (error) {
        console.error('Chyba:', error.message);
        process.exit(1);
    }
}

buildBlog();
