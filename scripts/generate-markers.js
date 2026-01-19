/**
 * NFT Marker 批量生成脚本
 * 
 * 功能：一键将 assets/images 下的所有图片生成 NFT Marker
 * 输出：生成的文件自动复制到 assets/markers 目录
 * 
 * 使用方法：
 *   node scripts/generate-markers.js
 *   node scripts/generate-markers.js --threads 8
 *   node scripts/generate-markers.js --force          # 强制重新生成所有
 *   node scripts/generate-markers.js --force 2.png    # 强制重新生成指定图片
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    // 源图片目录
    imagesDir: path.join(__dirname, '../assets/images'),
    // Marker 输出目录
    markersDir: path.join(__dirname, '../assets/markers'),
    // NFT Marker Creator 路径
    creatorDir: path.join(__dirname, '../Nft-Marker-Creator-App/src'),
    // 生成器脚本
    creatorScript: 'NFTMarkerCreator.js',
    // 支持的图片格式
    supportedFormats: ['.png', '.jpg', '.jpeg'],
    // 默认线程数
    defaultThreads: 4,
    // 生成参数
    generatorArgs: [
        '-noConf',              // 跳过确认提示
        '-dpi=72',              // DPI
        '-level=2',             // 特征密度（0-4，默认2）
        '-leveli=1',            // 初始特征密度（0-3，默认1）
        '-sd_thresh=8',         // 标准差阈值
        '-max_thresh=0.9',      // 最大特征阈值
        '-min_thresh=0.55',     // 最小特征阈值
        '-feature_density=70',  // 特征密度乘数
    ]
};

// 解析命令行参数
function parseArgs() {
    const args = process.argv.slice(2);
    let threads = CONFIG.defaultThreads;
    let force = false;
    let forceFiles = [];
    
    const threadIndex = args.indexOf('--threads');
    if (threadIndex !== -1 && args[threadIndex + 1]) {
        threads = parseInt(args[threadIndex + 1], 10) || CONFIG.defaultThreads;
    }
    
    const forceIndex = args.indexOf('--force');
    if (forceIndex !== -1) {
        force = true;
        // 检查是否指定了特定文件
        for (let i = forceIndex + 1; i < args.length; i++) {
            if (args[i].startsWith('--')) break;
            forceFiles.push(args[i]);
        }
    }
    
    return { threads, force, forceFiles };
}

// 获取所有图片文件
function getImageFiles() {
    if (!fs.existsSync(CONFIG.imagesDir)) {
        console.error(`错误: 图片目录不存在 ${CONFIG.imagesDir}`);
        process.exit(1);
    }
    
    const files = fs.readdirSync(CONFIG.imagesDir);
    return files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return CONFIG.supportedFormats.includes(ext);
    });
}

// 检查 marker 是否已存在
function markerExists(imageName) {
    const baseName = path.parse(imageName).name;
    const requiredFiles = ['.fset', '.fset3', '.iset'];
    return requiredFiles.every(ext => 
        fs.existsSync(path.join(CONFIG.markersDir, baseName + ext))
    );
}

// 生成单个 marker
function generateMarker(imageName, threads) {
    return new Promise((resolve, reject) => {
        const baseName = path.parse(imageName).name;
        const srcImage = path.join(CONFIG.imagesDir, imageName);
        const tempImage = path.join(CONFIG.creatorDir, imageName);
        
        console.log(`\n📷 处理: ${imageName}`);
        
        // 复制图片到生成器目录
        fs.copyFileSync(srcImage, tempImage);
        
        // 构建命令参数
        const args = [
            CONFIG.creatorScript,
            '-i', imageName,
            ...CONFIG.generatorArgs,
            '--threaded', threads.toString()
        ];
        
        console.log(`   命令: node ${args.join(' ')}`);
        
        const startTime = Date.now();
        
        const child = spawn('node', args, {
            cwd: CONFIG.creatorDir,
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        
        child.stdout.on('data', (data) => {
            const str = data.toString();
            output += str;
            // 只显示关键信息
            if (str.includes('Confidence level') || str.includes('took')) {
                console.log(`   ${str.trim()}`);
            }
        });
        
        child.stderr.on('data', (data) => {
            output += data.toString();
        });
        
        child.on('close', (code) => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            
            // 清理临时文件
            if (fs.existsSync(tempImage)) {
                fs.unlinkSync(tempImage);
            }
            
            if (code === 0) {
                // 复制生成的文件到 markers 目录
                const outputDir = path.join(CONFIG.creatorDir, 'output');
                const extensions = ['.fset', '.fset3', '.iset'];
                
                extensions.forEach(ext => {
                    const src = path.join(outputDir, baseName + ext);
                    const dest = path.join(CONFIG.markersDir, baseName + ext);
                    if (fs.existsSync(src)) {
                        fs.copyFileSync(src, dest);
                    }
                });
                
                console.log(`   ✅ 完成 (${duration}s)`);
                resolve({ name: imageName, success: true, duration });
            } else {
                console.log(`   ❌ 失败 (code: ${code})`);
                resolve({ name: imageName, success: false, error: output });
            }
        });
    });
}

// 主函数
async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('       NFT Marker 批量生成工具');
    console.log('═══════════════════════════════════════════\n');
    
    const { threads, force, forceFiles } = parseArgs();
    
    // 确保输出目录存在
    if (!fs.existsSync(CONFIG.markersDir)) {
        fs.mkdirSync(CONFIG.markersDir, { recursive: true });
    }
    
    // 获取图片列表
    const images = getImageFiles();
    
    if (images.length === 0) {
        console.log('没有找到需要处理的图片');
        return;
    }
    
    console.log(`📁 图片目录: ${CONFIG.imagesDir}`);
    console.log(`📁 输出目录: ${CONFIG.markersDir}`);
    console.log(`🧵 线程数: ${threads}`);
    console.log(`📷 图片数量: ${images.length}`);
    console.log(`   ${images.join(', ')}`);
    
    // 检查哪些需要生成
    const toGenerate = [];
    const skipped = [];
    
    images.forEach(img => {
        // 判断是否需要强制生成
        const shouldForce = force && (forceFiles.length === 0 || forceFiles.includes(img));
        
        if (!shouldForce && markerExists(img)) {
            skipped.push(img);
        } else {
            toGenerate.push(img);
        }
    });
    
    if (skipped.length > 0) {
        console.log(`\n⏭️  跳过 (已存在): ${skipped.join(', ')}`);
    }
    
    if (toGenerate.length === 0) {
        console.log('\n✅ 所有 marker 已存在，无需生成');
        return;
    }
    
    console.log(`\n🚀 开始生成 ${toGenerate.length} 个 marker...`);
    
    const results = [];
    const totalStart = Date.now();
    
    // 逐个生成（避免并发问题）
    for (const img of toGenerate) {
        const result = await generateMarker(img, threads);
        results.push(result);
    }
    
    const totalDuration = ((Date.now() - totalStart) / 1000).toFixed(1);
    
    // 汇总结果
    console.log('\n═══════════════════════════════════════════');
    console.log('                 生成完成');
    console.log('═══════════════════════════════════════════');
    
    const success = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ 成功: ${success.length}`);
    if (failed.length > 0) {
        console.log(`❌ 失败: ${failed.length}`);
        failed.forEach(f => console.log(`   - ${f.name}`));
    }
    console.log(`⏱️  总耗时: ${totalDuration}s`);
    
    // 列出最终的 markers
    console.log('\n📦 当前 markers 目录:');
    const markers = fs.readdirSync(CONFIG.markersDir);
    const markerGroups = {};
    markers.forEach(f => {
        const base = path.parse(f).name;
        if (!markerGroups[base]) markerGroups[base] = [];
        markerGroups[base].push(path.extname(f));
    });
    Object.keys(markerGroups).sort().forEach(base => {
        console.log(`   ${base}: ${markerGroups[base].join(', ')}`);
    });
}

main().catch(console.error);
