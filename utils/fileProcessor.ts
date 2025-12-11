import JSZip from 'jszip';

const IGNORED_DIRS = ['node_modules', '.git', 'dist', 'build', '.vscode', '.idea', '__pycache__', 'coverage', '.next', 'out', 'target', 'vendor', 'bin', 'obj'];

const TEXT_EXTENSIONS = new Set([
  // Web
  'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'scss', 'less', 'json', 'md', 'svg',
  // Backend/System
  'py', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'pl', 'pm', 'sh', 'bat', 'ps1',
  // Config/Data
  'yaml', 'yml', 'xml', 'toml', 'ini', 'sql', 'graphql',
  // Misc
  'dockerfile', 'gitignore', 'env', 'txt', 'conf', 'properties', 'gradle', 'lock'
]);

const SPECIFIC_FILES = new Set([
    'Dockerfile', 'Makefile', 'LICENSE', 'README', 'Gemfile', 'Procfile', 'Rakefile', '.gitignore', '.env'
]);

// Helper to check if file is text/code and not in ignored folder
const isCodeFile = (filename: string): boolean => {
  // Check ignored directories
  if (IGNORED_DIRS.some(dir => filename.includes(`/${dir}/`) || filename.startsWith(`${dir}/`))) {
    return false;
  }
  
  // Handle files with no extension or dotfiles
  const parts = filename.split('/');
  const name = parts[parts.length - 1];
  
  // Exact match filenames
  if (SPECIFIC_FILES.has(name)) return true;
  
  // Check extension
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === 0) return false; // No extension or just dotfile like .DS_Store (unless in allowlist above)
  
  const ext = name.substring(dotIndex + 1).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
};

export const processCodebase = async (file: File, onProgress: (percent: number) => void): Promise<string> => {
  onProgress(5); // Started
  
  const zip = new JSZip();
  let loadedZip;
  
  try {
    loadedZip = await zip.loadAsync(file);
  } catch (error) {
    throw new Error("Failed to load ZIP file. It might be corrupted.");
  }

  onProgress(20); // Loaded zip structure

  let fullContext = '';
  const filePaths = Object.keys(loadedZip.files);
  const totalFiles = filePaths.length;
  let processedCount = 0;

  for (const relativePath of filePaths) {
      const zipEntry = loadedZip.files[relativePath];
      
      if (!zipEntry.dir && isCodeFile(relativePath)) {
          try {
              const content = await zipEntry.async('string');
              fullContext += `--- START FILE: ${relativePath} ---\n${content}\n--- END FILE ---\n\n`;
          } catch (e) {
              console.warn(`Could not read file: ${relativePath}`, e);
          }
      }
      
      processedCount++;
      
      // Update progress roughly between 20 and 95
      if (processedCount % 5 === 0 || processedCount === totalFiles) {
        const currentPercent = 20 + (processedCount / totalFiles) * 75;
        onProgress(Math.min(currentPercent, 99));
        // Yield to main thread to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 0));
      }
  }
  
  onProgress(100);
  return fullContext;
};