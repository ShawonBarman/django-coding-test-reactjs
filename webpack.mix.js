const mix = require('laravel-mix');

mix.js('src/templates/assets/js/app.js', 'src/static/js').react()
    .sass('src/templates/assets/scss/main.scss', 'src/static/css');
