const { addonBuilder } = require("stremio-addon-sdk");
const express = require("express");
const path = require("path");

const manifest = {
    id: "community.dbz.vietsub.addon",
    version: "1.0.0",
    name: "Dragon Ball Z Vietsub Pack",
    description: "Cung cấp 291 tập phụ đề tiếng Việt chuẩn cho Dragon Ball Z (1989-1996).",
    logo: "https://squarespace-cdn.com",
    resources: ["subtitles"],
    types: ["series"],
    idPrefixes: ["tt"],
    catalogs: [] // Bắt buộc phải có mảng rỗng này để tránh lỗi "must be an array"
};

const builder = new addonBuilder(manifest);
const app = express();
const PORT = process.env.PORT || 7000;

app.use("/subtitles-files", express.static(path.join(__dirname, "subtitles")));

builder.defineSubtitlesHandler((args) => {
    if (args.id.startsWith("tt0121220")) {
        const parts = args.id.split(":");
        const episodeNumber = parseInt(parts[2], 10);

        const formattedEp = String(episodeNumber).padStart(3, '0');
        const subUrl = `${addonInterface.config?.baseUrl || `http://localhost:${PORT}`}/subtitles-files/ep_${formattedEp}.srt`;

        return Promise.resolve({
            subtitles: [
                {
                    id: `dbz_vi_${formattedEp}`,
                    url: subUrl,
                    lang: "vie",
                    label: "Tiếng Việt (Chuẩn 291 Tập)"
                }
            ]
        });
    }
    return Promise.resolve({ subtitles: [] });
});

const addonInterface = builder.getInterface();
app.use("/", (req, res, next) => {
    if (!addonInterface.config) addonInterface.config = {};
    addonInterface.config.baseUrl = `${req.protocol}://${req.get('host')}`;
    next();
});

app.get('/', (req, res) => res.send(addonInterface.manifest));
app.get('/manifest.json', (req, res) => res.json(addonInterface.manifest));
app.get('/subtitles/:type/:id.json', (req, res) => {
    addonInterface.builders.subtitles(req.params).then(result => res.json(result));
});

app.listen(PORT, () => {
    console.log(`Addon đang chạy tại: http://localhost:${PORT}/manifest.json`);
});