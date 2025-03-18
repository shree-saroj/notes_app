const Service = require("node-windows").Service;

const svc = new Service({
  name: "Notes App Backend",
  description: "Notes App Backend Started Successfully!",
  script: "D:\\Personal\\Learn\\MERN\\notes_app\\backend\\index.js",
});

svc.on("install", function () {
  svc.start();
});

svc.install();
