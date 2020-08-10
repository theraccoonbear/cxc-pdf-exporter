let links = [];

$('li').each((i, li) => {
    const $li = $(li);
    const $e = $li.find('a');
    links.push({
        title: $e.text(),
        url: $e.attr('href'),
        fullText: $li.text()
    });
});
console.log(JSON.stringify(links, null, 2));