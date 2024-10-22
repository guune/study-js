const fs = require("fs").promises;
const path = require("path");

// 디렉토리 내의 모든 파일을 재귀적으로 찾는 함수
async function getFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? getFiles(fullPath) : fullPath;
    })
  );
  return files.flat();
}

// 미리보기 모드 함수
async function previewChanges(directory) {
  try {
    const files = await getFiles(directory);
    const mdFiles = files.filter((file) => path.extname(file) === ".md");
    let changeCount = 0;

    console.log("\n다음과 같이 변환될 예정입니다:");
    console.log("----------------------------------------");

    for (const file of mdFiles) {
      const content = await fs.readFile(file, "utf-8");
      const matches = content.match(/!\[\[(.*?)\]\]/g);

      if (matches) {
        console.log(`\n파일: ${file}`);
        matches.forEach((match) => {
          const originalName = match;
          const newName = match.replace(/!\[\[(.*?)\]\]/g, (_, filename) => {
            return `![${filename}](./images/${filename.replace(/\s+/g, "%20")})`;
          });
          console.log("변환 전:", originalName);
          console.log("변환 후:", newName);
          changeCount++;
        });
      }
    }

    console.log("\n----------------------------------------");
    console.log(`총 ${changeCount}개의 이미지 링크가 변환 대상입니다.`);
  } catch (error) {
    console.error("미리보기 에러:", error);
  }
}

// 실제 변환 함수
async function convertContent(directory) {
  try {
    const files = await getFiles(directory);
    const mdFiles = files.filter((file) => path.extname(file) === ".md");

    for (const file of mdFiles) {
      let content = await fs.readFile(file, "utf-8");

      // ![[파일명]] 형식을 찾아서 변환
      const newContent = content.replace(/!\[\[(.*?)\]\]/g, (_, filename) => {
        return `![${filename}](./images/${filename.replace(/\s+/g, "%20")})`;
      });

      // 변경된 내용이 있을 때만 파일 저장
      if (content !== newContent) {
        await fs.writeFile(file, newContent, "utf-8");
        console.log(`파일 변환 완료: ${file}`);
      }
    }

    console.log("모든 MD 파일 내용 변환이 완료되었습니다.");
  } catch (error) {
    console.error("변환 에러:", error);
  }
}

// 사용할 디렉토리 경로 설정
const directory = "./"; // 여기에 실제 경로를 입력하세요

// 미리보기 실행 후 실제 변환 수행
previewChanges(directory).then(() => {
  // console.log("\n미리보기를 확인하셨나요? 실제 변환을 시작하려면 아래 주석을 해제하세요.");
  convertContent(directory); // 이 줄의 주석을 해제하면 실제 변환이 실행됩니다.
});
