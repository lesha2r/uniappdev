const config: Record<string, any> = {};

config.publicPath = '/src/public';

// Папка для экспортируемых пользовательских отчетов
config.exportFolderName = '/exports';

// Запускать удаление устаревших файлов каждый, мс
// config.clearExportFolderMs = 1000 * 60 * 60 * 48;

// Удалять файлы старше Х часов
config.removeOlderThanHours = 24;

export default config;