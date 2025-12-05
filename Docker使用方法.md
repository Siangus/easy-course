Docker使用方法

构建项目：

```bash
docker compose build --no-cache
```

启动项目：

```bash
docker compose up -d
```



关闭项目：

```bash
docker compose down
```

完全删除项目：

```bash
docker compose down -v
```

然后删mysql-data这个文件夹（这个文件夹下保存了mysql使用的数据）