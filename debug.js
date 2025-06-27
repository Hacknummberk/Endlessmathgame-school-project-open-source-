const func_ = {
    run: true
};

function sendtowebhook(message) {
    const url = "";
    fetch(url, {
        method: 'POST',
        headers: { 'Content-type': 'application/json ' },
        body: JSON.stringify({
            username: 'Dev Logger',
            content: `[DEBUG] ${message}`,
        })
    }).catch(err => console.warn('Webhook failed', err));
}

document.getElementById('answer').addEventListener('input', function (e) {
    if (e.target.value === 'disable_all') {
        sendtowebhook('All function disable via secret code.');
        alert('[!] Warning all function are disable');
    }
});

function importantfeature() {
    if (!func_.run) {
        console.warn('Feature disable');
        return;
    }
    console.log('Running important feature...');
}
