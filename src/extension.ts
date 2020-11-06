// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as xml2js from 'xml2js';

var htmlBeginning = `<!DOCTYPE html>
  <html lang="en">
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>AutoUI</title>
  </head>
  <body>`;

var htmlEnding = `</body></html>`;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('cpi-xml-viewer.open', (uri:vscode.Uri) => {
			// Create and show a new webview
			const panel = vscode.window.createWebviewPanel(
				'catCoding', // Identifies the type of the webview. Used internally
				'AutoUI', // Title of the panel displayed to the user
				vscode.ViewColumn.One, // Editor column to show the new webview panel in.
				{} // Webview options. More on these later.
			);
			panel.webview.html = getWebviewContent(uri.path);
		})
	);


}

function getWebviewContent(filePath:string) { 
    var result:any = [];
    var str = fs.readFileSync(filePath, 'utf8');
    var parser = new xml2js.Parser();
    parser.parseString(str, (e:any, r:any) => {result = r});
    var divs = "";
    var variantList = result["ComponentMetadata"]["Variant"];
    for(var i = 0; i < variantList.length; i++) {
        var variantName = variantList[i]["$"].VariantName;
        var variantsDiv = "<div>" + "<h1>Variant: " + variantName + "</h1>";
        var tabsList = variantList[i]["Tab"];
        for(var j = 0; j < tabsList.length; j++) {
            var tabHeading = tabsList[j]["GuiLabels"][0]["Label"][0]["_"];
            var tabsDiv = "<div><h2>Tab: " + tabHeading + "</h2>";
            var attributeGroups = tabsList[j]["AttributeGroup"];
            for(var k = 0; k < attributeGroups.length; k++) {
                var attributeGroupLabel = attributeGroups[k]["GuiLabels"][0]["Label"][0]["_"];
                var attributeGroupsDiv = "<div><h3>" + attributeGroupLabel + "</h3>";
                var attributeReferences = attributeGroups[k]["AttributeReference"];
                for(var l = 0; l < attributeReferences.length; l++) {
                    var referenceName = attributeReferences[l].ReferenceName[0];
                    var description = attributeReferences[l].description[0];
                    var attributeReferencesDiv = "<div><h4>" + referenceName + "</h4>" +"Description- " + description + "</div>";
                    attributeGroupsDiv += attributeReferencesDiv;
                }
                attributeGroupsDiv += "</div>";
                tabsDiv += attributeGroupsDiv;
            }
            tabsDiv += "</div>";
            variantsDiv += tabsDiv;
        }
        variantsDiv += "</div>";
        divs += variantsDiv;
    }
    // for(var i =  0; i< arr.length;i++) {
    //     divs = divs + `<div>` + result["edmx:Edmx"]["edmx:DataServices"][0]["Schema"][0]["EntityType"][i]["Key"][0]["PropertyRef"][0]['$']["Name"] + `</div> <br />`;
    // }
    return htmlBeginning + `<div>` + divs + `</div>` + htmlEnding;
}

// this method is called when your extension is deactivated
export function deactivate() { }
