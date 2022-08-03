import IOR from "../../3_services/IOR.interface.mjs";
import Loader, { loadingConfig } from "../../3_services/Loader.interface.mjs";
import { urlProtocol } from "../../3_services/Url.interface.mjs";
import UUiD from "../JSExtensions/UUiD.class.mjs";
import DefaultUrl, { formatType } from "./DefaultUrl.class.mjs";

// TODO add annotation
// @ClassDescriptor.componentExport("namedExport")
export default class DefaultIOR extends DefaultUrl implements IOR {
    private _referencedObject: any;
    public loader: Loader | undefined;
    public package: string | undefined = undefined;
    public version: string | undefined = undefined;
    public namespaceObject: string | undefined = undefined;

    static async load(iorString: string, config?: loadingConfig) {
        return new this().init(iorString).load(config);
    }

    static getIORType(urlObject: DefaultIOR | string) {
        const href = (urlObject instanceof DefaultIOR ? urlObject.href : urlObject)

        if (href.startsWith('ior')) {
            if (href.includes(':ude')) {
                return 'ude';
            }
            return 'default';
        }
        return false;
    }

    static createUdeIor(): IOR {
        //HACK Need to change that later
        const IOR = new DefaultIOR().init('ior:ude:http://localhost:3000/UDE/' + UUiD.uuidv4());
        return IOR;
    }

    init(url: string) {
        this.href = url;
        return this;
    }

    get href() {
        return super.href;
    }

    // Extra setter to add ior Protocol 
    set href(value: string) {
        super.href = value;
        if (!this.protocol.includes(urlProtocol.ior)) {
            this.protocol.unshift(urlProtocol.ior);
        }
    }

    protected _parseUrl(url: string): void {
        if (!url.includes(":esm:")) {
            super._parseUrl(url);
            return;
        }

        url = this._parseProtocols(url);
        url = this._parsePackageAndVersion(url);

        if (url.length > 0) throw new Error("Url string parse failed " + url);

    }

    protected _parsePackageAndVersion(url: string): string {
        let packageMatch = url.match(/^\/?([^:\[]+)(\[([\^\.\d\-_a-zA-Z#]+)\])?(\/(.+))?$/);
        if (packageMatch) {
            this.package = packageMatch[1];
            this.version = packageMatch[3];
            this.namespaceObject = packageMatch[5]
            url = url.substring(packageMatch[0].length)
        }
        return url;
    }

    protected _formatUrl(protocolFilter: urlProtocol[] = [], type: formatType = formatType.normal) {

        if (!this.protocol.includes(urlProtocol.esm)) {
            return super._formatUrl(protocolFilter, type);
        }
        let url = '';

        let protocol;

        if (protocolFilter.length > 0) {
            // @ts-ignore
            protocol = this.protocol.filter(p => { return protocolFilter.includes(p) })
        } else {
            protocol = this.protocol
        }
        if (type === formatType.origin) return '';
        url += protocol.join(':') + ':/';
        url += this.package;
        if (this.version) url += `[${this.version}]`

        if (this.namespaceObject) url += `/${this.namespaceObject}`

        return url;
    }

    get isLoaded() {
        return this._referencedObject !== undefined;
    }

    get id() {
        if (this.searchParameters?.id) return this.searchParameters.id

        if (this.protocol.includes(urlProtocol.ude)) {
            const id = this.pathName?.split('/').pop();
            if (id) return id;
        }
        return super.id;
    }

    set id(newId) {
        if (this.protocol.includes(urlProtocol.ude)) {
            let path = this.pathName?.split('/')
            if (!path) throw new Error('Wrong ude Format')
            path.splice(-1)
            this.pathName = path.join('/') + '/' + newId

        }
    }

    get basePath(): string | undefined {
        if (!this.pathName) return undefined;
        let a = this.pathName.split('/');
        a.splice(-1);
        return a.join('/');
    }

    get originBasePath(): string | undefined {
        if (!this.pathName) return undefined;
        let a = this.pathName.split('/');
        a.splice(-1);
        return this.origin + a.join('/');
    }

    get udeUniquePath() {
        let result = 'ior:';

        if (!this.protocol.includes(urlProtocol.ude)) {
            //TODO ENV Handling
            result += this.origin || global.ONCE?.ENV?.ONCE_DEFAULT_URL;
        }
        result += this.pathName;
        return result;
    }

    clone(): IOR {
        return new DefaultIOR().init(this.href);
    }

    async discoverLoader(): Promise<Loader | undefined> {
        if (this.loader === undefined) {
            const DefaultLoader = (await import("../Loader/DefaultLoader.class.mjs")).default;
            this.loader = await DefaultLoader.findLoader(this);
        }
        return this.loader;
    }

    async load(config?: loadingConfig) {
        await this.discoverLoader();
        if (!this.loader) {
            throw new Error("No Loader found for IOR " + this.href);
        }

        let loadingPromiseOrObject = this.loader.load(this, config);
        loadingPromiseOrObject.then(object => {
            if (object) {
                this._referencedObject = object;
            }
        }).catch(error => { });
        return loadingPromiseOrObject;
    }

}
