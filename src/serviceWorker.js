export function register() {
    if ('serviceWorker' in navigator) {
        const swUrl = '/public/service-worker.js';
        navigator.serviceWorker
             .register(swUrl)
             .then(registration => {
                 console.error('Service worker registration successful: ', registration.scope);

                 registration.onupdatefound = () => {
                     const installingWorker = registration.installing;
                     if (installingWorker == null) {
                         return;
                     }
                     installingWorker.onstatechange = () => {
                         if (installingWorker.state === 'installed') {
                             if (navigator.serviceWorker.controller) {
                                 console.log('New content is available and will be used when all tabs for this page are closed.');
                             } else {
                                 console.log('Content is cached for offline use.');
                             }
                         }
                     };
                 };
             })
             .catch(error => {
                 console.error('Error during service worker registration:', error);
             });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.unregister();
        });
    }
}

export default {
    register,
    unregister
}