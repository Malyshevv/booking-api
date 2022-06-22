import express from 'express';
import listEndpoints from 'express-list-endpoints';
import {verifyToken} from "../../middleware/jwtAuth";

export const router = express.Router({
    strict: true
});

router.get("/", (req, res) => {
    res.render("index.hbs", { title: "Главная" });
});

router.get("/routes", function(req, res){
    res.send({ routerList: JSON.stringify(listEndpoints(req.app.get('app')))});
});

router.get("*", function(req, res){
    res.render("404.hbs", { title: "Not Found" });
});
