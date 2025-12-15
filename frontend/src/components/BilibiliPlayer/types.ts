// 公共类型定义
export interface PlayerOptions {
  autoplay: boolean;
  muted: boolean;
  danmaku: boolean;
  t: number;
  p: number;
}

// BibiGPT API响应类型
export interface BibiGPTResponse {
  success: boolean;
  id: string;
  service: string;
  sourceUrl: string;
  htmlUrl: string;
  costDuration: number;
  remainingTime: number;
  summary: string;
  message?: string; // 错误信息字段
  detail?: {
    summary: string;
    dbId: string;
    id: string;
    embedId: string;
    pageId: string;
    url: string;
    rawLang: string;
    audioUrl: string;
    playUrl: string;
    type: string;
    title: string;
    cover: string;
    author: string;
    authorId: string;
    duration: number;
    subtitlesArray?: Array<{
      startTime: number;
      end: number;
      text: string;
      index: number;
      speaker_id?: number;
      _isGrouped?: boolean;
      _originalSubtitles?: any[];
    }>;
    descriptionText: string;
    contentText: string;
    chapters?: Array<{
      from: number;
      to: number;
      content: string;
      type?: number;
      imgUrl?: string;
    }>;
    local_path: string;
  };
}
