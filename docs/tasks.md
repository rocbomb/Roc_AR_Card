# AR动漫卡片召唤器 - 开发任务

## 阶段一：环境搭建与验证

### Task 1: 素材准备
- [ ] 收集全部卡片图片（约10张），放入 `assets/images/`
- [ ] 准备对应的3D模型文件（.glb格式），放入 `assets/models/`
- [ ] 建立卡片与模型的对应关系表

### Task 2: 生成 NFT Marker
- [ ] 为每张卡片生成 marker 文件
- [ ] 命令：`cd Nft-Marker-Creator-App/src && node NFTMarkerCreator.js -i 图片.png -noConf`
- [ ] 将生成的 .fset/.fset3/.iset 文件复制到 `assets/markers/`
- [ ] 文件命名与卡片对应（如 card-01, card-02...）

**当前进度**：
- ✅ 已有图片：2.png, 3.png, 4.png
- ✅ 已生成 marker：2.fset/fset3/iset

### Task 3: 创建基础页面
- [ ] 创建 `index.html`
- [ ] 引入 A-Frame 和 AR.js 库
- [ ] 实现单卡识别 + 单模型显示（验证技术可行性）

---

## 阶段二：核心功能开发

### Task 4: 多卡识别
- [ ] 配置全部10张卡片的 marker
- [ ] 每个 `<a-nft>` 节点对应一张卡片
- [ ] 测试多卡识别准确性

### Task 5: 模型调优
- [ ] 调整每个模型的 position（位置）
- [ ] 调整每个模型的 scale（大小）
- [ ] 调整每个模型的 rotation（朝向）
- [ ] 记录每个模型的最佳参数

### Task 6: 跟踪优化
- [ ] 测试跟踪稳定性
- [ ] 调整 smooth/smoothCount 参数
- [ ] 处理卡片遮挡/丢失情况

---

## 阶段三：体验优化

### Task 7: 加载界面
- [ ] 添加 Loading 界面
- [ ] 显示加载进度
- [ ] AR 就绪后隐藏 Loading

### Task 8: 用户引导
- [ ] 未识别时显示提示文字
- [ ] 识别成功时的视觉反馈
- [ ] 摄像头权限被拒绝时的处理

### Task 9: 模型动画（可选）
- [ ] 模型出现时的入场动画
- [ ] 模型轻微浮动/旋转效果

---

## 阶段四：测试与部署

### Task 10: 兼容性测试
- [ ] iOS Safari 测试
- [ ] Android Chrome 测试
- [ ] 不同光照条件测试

### Task 11: 部署上线
- [ ] 部署到 HTTPS 服务器（GitHub Pages / Netlify / Vercel）
- [ ] 生成访问二维码
- [ ] 真机完整测试

---

## 卡片-模型对应表

| 卡片 | 图片文件 | Marker | 3D模型 | 状态 |
|------|----------|--------|--------|------|
| 1 | 2.png | 2 | 待定 | Marker ✅ |
| 2 | 3.png | - | 待定 | 待生成 |
| 3 | 4.png | - | 待定 | 待生成 |
| 4 | - | - | - | 待准备 |
| 5 | - | - | - | 待准备 |
| ... | | | | |

---

## 常用命令

```bash
# 生成 NFT Marker
cd Nft-Marker-Creator-App/src
node NFTMarkerCreator.js -i 图片名.png -noConf

# 启动本地服务器（需要 HTTPS）
npx serve .
```
