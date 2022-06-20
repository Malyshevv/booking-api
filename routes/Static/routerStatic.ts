import express from 'express';

export const router = express.Router({
    strict: true
});

router.get("/", (req, res) => {
    res.render("index.hbs", { title: "Главная" });
});

router.get("*", function(req, res){
    res.render("404.hbs", { title: "Not Found" });
});
