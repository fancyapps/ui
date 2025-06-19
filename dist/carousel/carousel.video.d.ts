import { CarouselInstance } from "./carousel";
export type VideoOptions = {
    /**
     * If videos should start playing automatically after they are displayed
     */
    autoplay: boolean;
    /**
     * Optional custom HTML5 video format
     */
    html5videoFormat?: string;
    /**
     * HTML5 video element template
     */
    html5videoTpl: string;
    /**
     * Attributes of an iframe element
     */
    iframeAttr: Record<string, string>;
    /**
     * Vimeo embedded player parameters; see https://vimeo.zendesk.com/hc/en-us/articles/360001494447-Player-parameters-overview
     */
    vimeo: {
        byline: 0 | 1;
        color: string;
        controls: 0 | 1;
        dnt: 0 | 1;
        muted: 0 | 1;
    };
    /**
     * YouTube embedded player parameters; see https://developers.google.com/youtube/player_parameters#Parameters
     */
    youtube: {
        controls?: 0 | 1;
        enablejsapi?: 0 | 1;
        nocookie?: 0 | 1;
        rel?: 0 | 1;
        fs?: 0 | 1;
    };
};
export type VideoInstance = ReturnType<typeof Video>;
declare module "./carousel" {
    interface CarouselOptions {
        Video?: boolean | Partial<VideoOptions>;
    }
    interface CarouselPlugins {
        Video: CarouselPlugin & VideoInstance;
    }
    interface CarouselSlide {
        src?: string;
        type?: "video" | string;
        thumb?: string | HTMLImageElement;
        contentEl?: HTMLElement;
        width?: string | number;
        height?: string | number;
        aspectRatio?: string;
        autoplay?: boolean;
        poster?: string;
        videoId?: string;
        html5videoTpl?: string;
        html5videoFormat?: string;
        poller?: ReturnType<typeof setTimeout>;
        /**
         * Vimeo embedded player parameters
         * https://vimeo.zendesk.com/hc/en-us/articles/360001494447-Player-parameters-overview
         */
        vimeo?: {
            byline: 0 | 1;
            color: string;
            controls: 0 | 1;
            dnt: 0 | 1;
            muted: 0 | 1;
        };
        /**
         * YouTube embedded player parameters
         * https://developers.google.com/youtube/player_parameters#Parameters
         */
        youtube?: {
            controls?: 0 | 1;
            enablejsapi?: 0 | 1;
            nocookie?: 0 | 1;
            rel?: 0 | 1;
            fs?: 0 | 1;
        };
    }
}
export declare const Video: () => {
    init: (carousel: CarouselInstance) => void;
    destroy: () => void;
};
