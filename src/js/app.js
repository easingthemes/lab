import serviceWorker from './serviceWorker';

console.log('app');

window.addEventListener('load', () => {
    if (process.env.NODE_ENV === 'production') {
        console.log('start register');
        serviceWorker.register();
    }
});
