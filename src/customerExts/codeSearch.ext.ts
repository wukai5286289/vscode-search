import axios from 'axios';
import * as vscode from 'vscode';
import getDocumentLanguage from './getDocumentLanguage';

const codeSearch = vscode.commands.registerCommand('code-search', () => {
  let currentEditor = vscode.window.activeTextEditor;
  if (!currentEditor) {
    return;
  }
  const { selection } = currentEditor;
  // 获取光标位置
  function getCursorPosition() {
    let curPos = selection.start;
    return curPos;
  }
  // 获取光标所在行的字符串函数
  function getCursorString() {
    let curPos = getCursorPosition();
    let curLineStart = new vscode.Position(curPos.line, 0);
    let nextLineStart = new vscode.Position(curPos.line + 1, 0);
    let rangeWithFirstCharOfNextLine = new vscode.Range(curLineStart, nextLineStart);
    let contentWithFirstCharOfNextLine = currentEditor.document.getText(rangeWithFirstCharOfNextLine);
    return contentWithFirstCharOfNextLine;
  }
  // 获取到光标所在行字符串
  let StringParams = getCursorString();
  const editor = vscode.window.activeTextEditor;
  // 获取光标所在文件是什么语言
  let lang = getDocumentLanguage(editor);
  // 将接口返回来的数据插入到编辑器中
  getInsertString().then(res => {
    const start = selection.start;
    let end;
    let snippetString = res.data.data;
    let snippet: vscode.SnippetString = new vscode.SnippetString(snippetString);
    editor.insertSnippet(snippet);
  });
  
  // 调用接口
  async function getInsertString() {
    let queryParams = {
      prompt: StringParams,
      language: lang.toLowerCase(),
    };
    // 接口i地址
    const baseUrl = 'https://biosdev.idea.edu.cn/generate/ours';
    let post = () => {
      return new Promise(resolve => {
        axios({
          method: 'get',
          url: baseUrl,
          params: queryParams,
        }).then(res => {
          if (res.status === 200) {
            resolve(res);
          }
        });
      });
    };
    let result = await post();
    return result;
  }

});

export default codeSearch;
