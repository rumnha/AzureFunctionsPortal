import {Http} from 'angular2/http';
import {Injectable} from 'angular2/core';
import {FunctionInfo} from '../models/function-info';
import {VfsObject} from '../models/vfs-object';
import {ScmInfo} from '../models/scm-info';
import {IFunctionsService} from './ifunctions.service';
import {Observable} from 'rxjs/Rx';
import {FunctionTemplate} from '../models/function-template';
import {DesignerSchema} from '../models/designer-schema';
import {FunctionSecrets} from '../models/function-secrets';

@Injectable()
export class MockFunctionsService implements IFunctionsService {
    private scmInfo: ScmInfo;

    constructor(private _http: Http) { }

    initializeUser() {
        return this._http.get('mocks/scmInfo.json')
            .map<ScmInfo>(r => {
                this.scmInfo = r.json();
                return this.scmInfo;
            });
    }

    getFunctions() {
        return this._http.get('mocks/functions.json')
            .map<FunctionInfo[]>(r => r.json());
    }

    getFunctionContent(functionInfo: FunctionInfo) {
        return this._http.get(`mocks/${functionInfo.name}.vfs.json`)
            .map<any>(r => {
                return {
                    files: r.json(),
                    functionInfo: functionInfo
                };
            });
    }

    getFileContent(file: VfsObject | string) {
        return this._http.get(typeof file === 'string' ? file : file.href)
            .map<string>(r => r.text());
    }

    saveFile(file: VfsObject, updatedContent: string) {
        console.log(file);
        console.log(updatedContent);
        return Observable.of(file);
    }

    createFunction(functionName: string, templateId: string) {
        console.log(functionName);
        console.log(templateId);
        return Observable.of({name: functionName});
    }

    getTemplates() {
        return this._http.get('mocks/functionTemplates.json')
            .map<FunctionTemplate[]>(r => r.json());
    }

    getNewFunctionNode(): FunctionInfo {
        return {
            name: 'New Function',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null
        };
    }

    getSettingsNode(): FunctionInfo {
        return {
            name: "Settings",
            href: null,
            config: null,
            script_href: 'mocks/host/host.json',
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null
        };
    }

    getLogStreamingNode() {
        return {
            name: 'Log Streaming',
            href: null,
            config: null,
            script_href: null,
            template_id: null,
            test_data_href: null,
            clientOnly: true,
            isDeleted: false,
            secrets_file_href: null
        };
    }

    getTestData(functionInfo: FunctionInfo) {
        return Observable.of('sample test data');
    }

    getRunStatus(functionInfo: FunctionInfo, runId: string) {
        return Observable.of(`status returned for ${functionInfo.name} run: ${runId}`);
    }

    runFunction(functionInfo: FunctionInfo, content: string) {
        console.log(functionInfo);
        console.log(content);
        return Observable.of("ran");
    }

    deleteFunction(functionInfo: FunctionInfo) {
        return Observable.of('Ok');
    }

    getDesignerSchema() {
        return this._http.get('mocks/function-json-schema.json')
            .map<DesignerSchema>(r => r.json());
    }

    warmupMainSite() {
        console.log('warming up site');
    }

    getSecrets(fi: FunctionInfo) {
        return Observable.of({ webHookReceiverKey: 'random'});
    }

    setSecrets(fi: FunctionInfo, secrets: FunctionSecrets) {
        return Observable.of(secrets);
    }

    getFunctionInvokeUrl(fi: FunctionInfo) {
        return `scm/${fi.name}`;
    }

    saveFunction(fi: FunctionInfo, config: any) {
        return Observable.of({
            config: config,
            name: fi.name,
            script_href: fi.script_href,
            test_data_href: fi.test_data_href,
            secrets_file_href: fi.secrets_file_href,
            href: fi.href,
            template_id: fi.template_id,
            clientOnly: fi.clientOnly,
            isDeleted: fi.isDeleted
        });
    }

    getFunction(fi: FunctionInfo) {
        return Observable.of(fi);
    }

    getScmUrl() {
        return this.scmInfo.scm_url;
    }

    getBearerHeader() {
        return 'Bearer token';
    }

    getBasicHeader() {
        return 'Basic Token';
    }
}