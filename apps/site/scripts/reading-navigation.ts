/** 导航独立于 React 控件启动，手机开侧栏不必等搜索、分页运行时解析。 */
import { enhanceReadingNavigation } from "../lib/readingNavigation";
import { enhanceSpatialNavigation } from "@oasismind/brand/spatial-interactions";

const content = document.querySelector<HTMLElement>("[data-reading-content]");
if (content) enhanceReadingNavigation(content);
enhanceSpatialNavigation();
