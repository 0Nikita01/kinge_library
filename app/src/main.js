import React from 'react';
import ReactDom from 'react-dom';
import Editor from './components/editor'

ReactDom.render (<Editor/>, document.getElementById('root'))

/*
function getPageList()
{
    $('h1').remove();
    $.get("./api", data => {
        data.forEach(file => {
            $("body").append(`<h1>${file}</h1>`)
        })
    }, "JSON");
}

getPageList();

$('.but').click(() => {
    $.post("./api/createNewPage.php", {
        "name" : $('input').val()
    }, () => {
        getPageList();
    })
    .fail(() => {
        alert("Page is exists!");
    })
});*/
