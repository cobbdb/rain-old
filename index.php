<?php

require "./eta.php";
H::setBase("../base.view");

$head = H::render("head.view");
$body = H::render("index.view");

echo H::render(null, Array(
    "head" => $head,
    "body" => $body
));
