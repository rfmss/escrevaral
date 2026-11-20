/* PageFlip 2.0.7 — Nodlik/StPageFlip ab30ecc1d9f6d98de1a99b8e296469382f41c120; MIT, veja LICENSE. */
(function(host){"use strict";const factories={
"src/BasicTypes":function(module,exports,require){
"use strict";


},
"src/Collection/HTMLPageCollection":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"HTMLPageCollection",{get:()=>HTMLPageCollection});





class HTMLPageCollection extends (require("src/Collection/PageCollection").PageCollection) {
    
    
    constructor(app, render, element, items){
        super(app, render);
        this.element = element;
        this.pagesElement = items;
    }
    load() {
        for (const pageElement of this.pagesElement){
            const page = new (require("src/Page/HTMLPage").HTMLPage)(this.render, pageElement, pageElement.dataset['density'] === 'hard' ? (require("src/Page/Page").PageDensity).HARD : (require("src/Page/Page").PageDensity).SOFT);
            page.load();
            this.pages.push(page);
        }
        this.createSpread();
    }
}

},
"src/Collection/ImagePageCollection":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"ImagePageCollection",{get:()=>ImagePageCollection});





class ImagePageCollection extends (require("src/Collection/PageCollection").PageCollection) {
    
    constructor(app, render, imagesHref){
        super(app, render);
        this.imagesHref = imagesHref;
    }
    load() {
        for (const href of this.imagesHref){
            const page = new (require("src/Page/ImagePage").ImagePage)(this.render, href, (require("src/Page/Page").PageDensity).SOFT);
            page.load();
            this.pages.push(page);
        }
        this.createSpread();
    }
}

},
"src/Collection/PageCollection":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"PageCollection",{get:()=>PageCollection});




class PageCollection {
    
    
    
    
    
    
    
    
    constructor(app, render){
        this.pages = [];
        this.currentPageIndex = 0;
        this.currentSpreadIndex = 0;
        this.landscapeSpread = [];
        this.portraitSpread = [];

        this.render = render;
        this.app = app;
        this.currentPageIndex = 0;
        this.isShowCover = this.app.getSettings().showCover;
    }
    destroy() {
        this.pages = [];
    }
    createSpread() {
        this.landscapeSpread = [];
        this.portraitSpread = [];
        for(let i = 0; i < this.pages.length; i++){
            this.portraitSpread.push([
                i
            ]);
        }
        let start = 0;
        if (this.isShowCover) {
            this.pages[0].setDensity((require("src/Page/Page").PageDensity).HARD);
            this.landscapeSpread.push([
                start
            ]);
            start++;
        }
        for(let i = start; i < this.pages.length; i += 2){
            if (i < this.pages.length - 1) this.landscapeSpread.push([
                i,
                i + 1
            ]);
            else {
                this.landscapeSpread.push([
                    i
                ]);
                this.pages[i].setDensity((require("src/Page/Page").PageDensity).HARD);
            }
        }
    }
    getSpread() {
        return this.render.getOrientation() === (require("src/Render/Render").Orientation).LANDSCAPE ? this.landscapeSpread : this.portraitSpread;
    }
    getSpreadIndexByPage(pageNum) {
        const spread = this.getSpread();
        for(let i = 0; i < spread.length; i++)if (pageNum === spread[i][0] || pageNum === spread[i][1]) return i;
        return null;
    }
    getPageCount() {
        return this.pages.length;
    }
    getPages() {
        return this.pages;
    }
    getPage(pageIndex) {
        if (pageIndex >= 0 && pageIndex < this.pages.length) {
            return this.pages[pageIndex];
        }
        throw new Error('Invalid page number');
    }
    nextBy(current) {
        const idx = this.pages.indexOf(current);
        if (idx < this.pages.length - 1) return this.pages[idx + 1];
        return null;
    }
    prevBy(current) {
        const idx = this.pages.indexOf(current);
        if (idx > 0) return this.pages[idx - 1];
        return null;
    }
    getFlippingPage(direction) {
        const current = this.currentSpreadIndex;
        if (this.render.getOrientation() === (require("src/Render/Render").Orientation).PORTRAIT) {
            return direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? this.pages[current].newTemporaryCopy() : this.pages[current - 1];
        } else {
            const spread = direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? this.getSpread()[current + 1] : this.getSpread()[current - 1];
            if (spread.length === 1) return this.pages[spread[0]];
            return direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? this.pages[spread[0]] : this.pages[spread[1]];
        }
    }
    getBottomPage(direction) {
        const current = this.currentSpreadIndex;
        if (this.render.getOrientation() === (require("src/Render/Render").Orientation).PORTRAIT) {
            return direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? this.pages[current + 1] : this.pages[current - 1];
        } else {
            const spread = direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? this.getSpread()[current + 1] : this.getSpread()[current - 1];
            if (spread.length === 1) return this.pages[spread[0]];
            return direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? this.pages[spread[1]] : this.pages[spread[0]];
        }
    }
    showNext() {
        if (this.currentSpreadIndex < this.getSpread().length) {
            this.currentSpreadIndex++;
            this.showSpread();
        }
    }
    showPrev() {
        if (this.currentSpreadIndex > 0) {
            this.currentSpreadIndex--;
            this.showSpread();
        }
    }
    getCurrentPageIndex() {
        return this.currentPageIndex;
    }
    show(pageNum = null) {
        if (pageNum === null) pageNum = this.currentPageIndex;
        if (pageNum < 0 || pageNum >= this.pages.length) return;
        const spreadIndex = this.getSpreadIndexByPage(pageNum);
        if (spreadIndex !== null) {
            this.currentSpreadIndex = spreadIndex;
            this.showSpread();
        }
    }
    getCurrentSpreadIndex() {
        return this.currentSpreadIndex;
    }
    setCurrentSpreadIndex(newIndex) {
        if (newIndex >= 0 && newIndex < this.getSpread().length) {
            this.currentSpreadIndex = newIndex;
        } else {
            throw new Error('Invalid page');
        }
    }
    showSpread() {
        const spread = this.getSpread()[this.currentSpreadIndex];
        if (spread.length === 2) {
            this.render.setLeftPage(this.pages[spread[0]]);
            this.render.setRightPage(this.pages[spread[1]]);
        } else {
            if (this.render.getOrientation() === (require("src/Render/Render").Orientation).LANDSCAPE) {
                if (spread[0] === this.pages.length - 1) {
                    this.render.setLeftPage(this.pages[spread[0]]);
                    this.render.setRightPage(null);
                } else {
                    this.render.setLeftPage(null);
                    this.render.setRightPage(this.pages[spread[0]]);
                }
            } else {
                this.render.setLeftPage(null);
                this.render.setRightPage(this.pages[spread[0]]);
            }
        }
        this.currentPageIndex = spread[0];
        this.app.updatePageIndex(this.currentPageIndex);
    }
}

},
"src/Event/EventObject":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"EventObject",{get:()=>EventObject});

class EventObject {
    constructor() { this.events = new Map(); }

    
    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, [
                callback
            ]);
        } else {
            this.events.get(eventName).push(callback);
        }
        return this;
    }
    off(event) {
        this.events.delete(event);
    }
    trigger(eventName, app, data = null) {
        if (!this.events.has(eventName)) return;
        for (const callback of this.events.get(eventName)){
            callback({
                data,
                object: app
            });
        }
    }
}

},
"src/Flip/Flip":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"FlipDirection",{get:()=>FlipDirection});
Object.defineProperty(exports,"FlipCorner",{get:()=>FlipCorner});
Object.defineProperty(exports,"FlippingState",{get:()=>FlippingState});
Object.defineProperty(exports,"Flip",{get:()=>Flip});






var FlipDirection = /*#__PURE__*/ function(FlipDirection) {
    FlipDirection[FlipDirection["FORWARD"] = 0] = "FORWARD";
    FlipDirection[FlipDirection["BACK"] = 1] = "BACK";
    return FlipDirection;
}({});
var FlipCorner = /*#__PURE__*/ function(FlipCorner) {
    FlipCorner["TOP"] = "top";
    FlipCorner["BOTTOM"] = "bottom";
    return FlipCorner;
}({});
var FlippingState = /*#__PURE__*/ function(FlippingState) {
    FlippingState["USER_FOLD"] = "user_fold";
    FlippingState["FOLD_CORNER"] = "fold_corner";
    FlippingState["FLIPPING"] = "flipping";
    FlippingState["READ"] = "read";
    return FlippingState;
}({});
class Flip {
    
    
    
    
    
    
    constructor(render, app){
        this.flippingPage = null;
        this.bottomPage = null;
        this.calc = null;
        this.state = "read";

        this.render = render;
        this.app = app;
    }
    fold(globalPos) {
        this.setState("user_fold");
        if (this.calc === null) this.start(globalPos);
        this.do(this.render.convertToPage(globalPos));
    }
    flip(globalPos) {
        if (this.app.getSettings().disableFlipByClick && !this.isPointOnCorners(globalPos)) return;
        if (this.calc !== null) this.render.finishAnimation();
        if (!this.start(globalPos)) return;
        const rect = this.getBoundsRect();
        this.setState("flipping");
        const topMargins = rect.height / 10;
        const yStart = this.calc.getCorner() === "bottom" ? rect.height - topMargins : topMargins;
        const yDest = this.calc.getCorner() === "bottom" ? rect.height : 0;
        this.calc.calc({
            x: rect.pageWidth - topMargins,
            y: yStart
        });
        this.animateFlippingTo({
            x: rect.pageWidth - topMargins,
            y: yStart
        }, {
            x: -rect.pageWidth,
            y: yDest
        }, true);
    }
    start(globalPos) {
        this.reset();
        const bookPos = this.render.convertToBook(globalPos);
        const rect = this.getBoundsRect();
        const direction = this.getDirectionByPoint(bookPos);
        const flipCorner = bookPos.y >= rect.height / 2 ? "bottom" : "top";
        if (!this.checkDirection(direction)) return false;
        try {
            this.flippingPage = this.app.getPageCollection().getFlippingPage(direction);
            this.bottomPage = this.app.getPageCollection().getBottomPage(direction);
            if (this.render.getOrientation() === (require("src/Render/Render").Orientation).LANDSCAPE) {
                if (direction === 1) {
                    const nextPage = this.app.getPageCollection().nextBy(this.flippingPage);
                    if (nextPage !== null) {
                        if (this.flippingPage.getDensity() !== nextPage.getDensity()) {
                            this.flippingPage.setDrawingDensity((require("src/Page/Page").PageDensity).HARD);
                            nextPage.setDrawingDensity((require("src/Page/Page").PageDensity).HARD);
                        }
                    }
                } else {
                    const prevPage = this.app.getPageCollection().prevBy(this.flippingPage);
                    if (prevPage !== null) {
                        if (this.flippingPage.getDensity() !== prevPage.getDensity()) {
                            this.flippingPage.setDrawingDensity((require("src/Page/Page").PageDensity).HARD);
                            prevPage.setDrawingDensity((require("src/Page/Page").PageDensity).HARD);
                        }
                    }
                }
            }
            this.render.setDirection(direction);
            this.calc = new (require("src/Flip/FlipCalculation").FlipCalculation)(direction, flipCorner, rect.pageWidth.toString(10), rect.height.toString(10));
            return true;
        } catch (e) {
            return false;
        }
    }
    do(pagePos) {
        if (this.calc === null) return;
        if (this.calc.calc(pagePos)) {
            const progress = this.calc.getFlippingProgress();
            this.bottomPage.setArea(this.calc.getBottomClipArea());
            this.bottomPage.setPosition(this.calc.getBottomPagePosition());
            this.bottomPage.setAngle(0);
            this.bottomPage.setHardAngle(0);
            this.flippingPage.setArea(this.calc.getFlippingClipArea());
            this.flippingPage.setPosition(this.calc.getActiveCorner());
            this.flippingPage.setAngle(this.calc.getAngle());
            if (this.calc.getDirection() === 0) {
                this.flippingPage.setHardAngle(90 * (200 - progress * 2) / 100);
            } else {
                this.flippingPage.setHardAngle(-90 * (200 - progress * 2) / 100);
            }
            this.render.setPageRect(this.calc.getRect());
            this.render.setBottomPage(this.bottomPage);
            this.render.setFlippingPage(this.flippingPage);
            this.render.setShadowData(this.calc.getShadowStartPoint(), this.calc.getShadowAngle(), progress, this.calc.getDirection());
        }
    }
    flipToPage(page, corner) {
        const current = this.app.getPageCollection().getCurrentSpreadIndex();
        const next = this.app.getPageCollection().getSpreadIndexByPage(page);
        try {
            if (next > current) {
                this.app.getPageCollection().setCurrentSpreadIndex(next - 1);
                this.flipNext(corner);
            }
            if (next < current) {
                this.app.getPageCollection().setCurrentSpreadIndex(next + 1);
                this.flipPrev(corner);
            }
        } catch (e) {}
    }
    flipNext(corner) {
        this.flip({
            x: this.render.getRect().left + this.render.getRect().pageWidth * 2 - 10,
            y: corner === "top" ? 1 : this.render.getRect().height - 2
        });
    }
    flipPrev(corner) {
        this.flip({
            x: 10,
            y: corner === "top" ? 1 : this.render.getRect().height - 2
        });
    }
    stopMove() {
        if (this.calc === null) return;
        const pos = this.calc.getPosition();
        const rect = this.getBoundsRect();
        const y = this.calc.getCorner() === "bottom" ? rect.height : 0;
        if (pos.x <= 0) this.animateFlippingTo(pos, {
            x: -rect.pageWidth,
            y
        }, true);
        else this.animateFlippingTo(pos, {
            x: rect.pageWidth,
            y
        }, false);
    }
    showCorner(globalPos) {
        if (!this.checkState("read", "fold_corner")) return;
        const rect = this.getBoundsRect();
        const pageWidth = rect.pageWidth;
        if (this.isPointOnCorners(globalPos)) {
            if (this.calc === null) {
                if (!this.start(globalPos)) return;
                this.setState("fold_corner");
                this.calc.calc({
                    x: pageWidth - 1,
                    y: 1
                });
                const fixedCornerSize = 50;
                const yStart = this.calc.getCorner() === "bottom" ? rect.height - 1 : 1;
                const yDest = this.calc.getCorner() === "bottom" ? rect.height - fixedCornerSize : fixedCornerSize;
                this.animateFlippingTo({
                    x: pageWidth - 1,
                    y: yStart
                }, {
                    x: pageWidth - fixedCornerSize,
                    y: yDest
                }, false, false);
            } else {
                this.do(this.render.convertToPage(globalPos));
            }
        } else {
            this.setState("read");
            this.render.finishAnimation();
            this.stopMove();
        }
    }
    animateFlippingTo(start, dest, isTurned, needReset = true) {
        const points = (require("src/Helper").Helper).GetCordsFromTwoPoint(start, dest);
        const frames = [];
        for (const p of points)frames.push(()=>this.do(p));
        const duration = this.getAnimationDuration(points.length);
        this.render.startAnimation(frames, duration, ()=>{
            if (!this.calc) return;
            if (isTurned) {
                if (this.calc.getDirection() === 1) this.app.turnToPrevPage();
                else this.app.turnToNextPage();
            }
            if (needReset) {
                this.render.setBottomPage(null);
                this.render.setFlippingPage(null);
                this.render.clearShadow();
                this.setState("read");
                this.reset();
            }
        });
    }
    getCalculation() {
        return this.calc;
    }
    getState() {
        return this.state;
    }
    setState(newState) {
        if (this.state !== newState) {
            this.app.updateState(newState);
            this.state = newState;
        }
    }
    getDirectionByPoint(touchPos) {
        const rect = this.getBoundsRect();
        if (this.render.getOrientation() === (require("src/Render/Render").Orientation).PORTRAIT) {
            if (touchPos.x - rect.pageWidth <= rect.width / 5) {
                return 1;
            }
        } else if (touchPos.x < rect.width / 2) {
            return 1;
        }
        return 0;
    }
    getAnimationDuration(size) {
        const defaultTime = this.app.getSettings().flippingTime;
        if (size >= 1000) return defaultTime;
        return size / 1000 * defaultTime;
    }
    checkDirection(direction) {
        if (direction === 0) return this.app.getCurrentPageIndex() < this.app.getPageCount() - 1;
        return this.app.getCurrentPageIndex() >= 1;
    }
    reset() {
        this.calc = null;
        this.flippingPage = null;
        this.bottomPage = null;
    }
    getBoundsRect() {
        return this.render.getRect();
    }
    checkState(...states) {
        for (const state of states){
            if (this.state === state) return true;
        }
        return false;
    }
    isPointOnCorners(globalPos) {
        const rect = this.getBoundsRect();
        const pageWidth = rect.pageWidth;
        const operatingDistance = Math.sqrt(Math.pow(pageWidth, 2) + Math.pow(rect.height, 2)) / 5;
        const bookPos = this.render.convertToBook(globalPos);
        return bookPos.x > 0 && bookPos.y > 0 && bookPos.x < rect.width && bookPos.y < rect.height && (bookPos.x < operatingDistance || bookPos.x > rect.width - operatingDistance) && (bookPos.y < operatingDistance || bookPos.y > rect.height - operatingDistance);
    }
}

},
"src/Flip/FlipCalculation":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"FlipCalculation",{get:()=>FlipCalculation});



class FlipCalculation {
    
    
    
    
    
    
    
    
    
    
    constructor(direction, corner, pageWidth, pageHeight){
        this.topIntersectPoint = null;
        this.sideIntersectPoint = null;
        this.bottomIntersectPoint = null;

        this.direction = direction;
        this.corner = corner;
        this.pageWidth = parseInt(pageWidth, 10);
        this.pageHeight = parseInt(pageHeight, 10);
    }
    calc(localPos) {
        try {
            this.position = this.calcAngleAndPosition(localPos);
            this.calculateIntersectPoint(this.position);
            return true;
        } catch (e) {
            return false;
        }
    }
    getFlippingClipArea() {
        const result = [];
        let clipBottom = false;
        result.push(this.rect.topLeft);
        result.push(this.topIntersectPoint);
        if (this.sideIntersectPoint === null) {
            clipBottom = true;
        } else {
            result.push(this.sideIntersectPoint);
            if (this.bottomIntersectPoint === null) clipBottom = false;
        }
        result.push(this.bottomIntersectPoint);
        if (clipBottom || this.corner === (require("src/Flip/Flip").FlipCorner).BOTTOM) {
            result.push(this.rect.bottomLeft);
        }
        return result;
    }
    getBottomClipArea() {
        const result = [];
        result.push(this.topIntersectPoint);
        if (this.corner === (require("src/Flip/Flip").FlipCorner).TOP) {
            result.push({
                x: this.pageWidth,
                y: 0
            });
        } else {
            if (this.topIntersectPoint !== null) {
                result.push({
                    x: this.pageWidth,
                    y: 0
                });
            }
            result.push({
                x: this.pageWidth,
                y: this.pageHeight
            });
        }
        if (this.sideIntersectPoint !== null) {
            if ((require("src/Helper").Helper).GetDistanceBetweenTwoPoint(this.sideIntersectPoint, this.topIntersectPoint) >= 10) result.push(this.sideIntersectPoint);
        } else {
            if (this.corner === (require("src/Flip/Flip").FlipCorner).TOP) {
                result.push({
                    x: this.pageWidth,
                    y: this.pageHeight
                });
            }
        }
        result.push(this.bottomIntersectPoint);
        result.push(this.topIntersectPoint);
        return result;
    }
    getAngle() {
        if (this.direction === (require("src/Flip/Flip").FlipDirection).FORWARD) {
            return -this.angle;
        }
        return this.angle;
    }
    getRect() {
        return this.rect;
    }
    getPosition() {
        return this.position;
    }
    getActiveCorner() {
        if (this.direction === (require("src/Flip/Flip").FlipDirection).FORWARD) {
            return this.rect.topLeft;
        }
        return this.rect.topRight;
    }
    getDirection() {
        return this.direction;
    }
    getFlippingProgress() {
        return Math.abs((this.position.x - this.pageWidth) / (2 * this.pageWidth) * 100);
    }
    getCorner() {
        return this.corner;
    }
    getBottomPagePosition() {
        if (this.direction === (require("src/Flip/Flip").FlipDirection).BACK) {
            return {
                x: this.pageWidth,
                y: 0
            };
        }
        return {
            x: 0,
            y: 0
        };
    }
    getShadowStartPoint() {
        if (this.corner === (require("src/Flip/Flip").FlipCorner).TOP) {
            return this.topIntersectPoint;
        } else {
            if (this.sideIntersectPoint !== null) return this.sideIntersectPoint;
            return this.topIntersectPoint;
        }
    }
    getShadowAngle() {
        const angle = (require("src/Helper").Helper).GetAngleBetweenTwoLine(this.getSegmentToShadowLine(), [
            {
                x: 0,
                y: 0
            },
            {
                x: this.pageWidth,
                y: 0
            }
        ]);
        if (this.direction === (require("src/Flip/Flip").FlipDirection).FORWARD) {
            return angle;
        }
        return Math.PI - angle;
    }
    calcAngleAndPosition(pos) {
        let result = pos;
        this.updateAngleAndGeometry(result);
        if (this.corner === (require("src/Flip/Flip").FlipCorner).TOP) {
            result = this.checkPositionAtCenterLine(result, {
                x: 0,
                y: 0
            }, {
                x: 0,
                y: this.pageHeight
            });
        } else {
            result = this.checkPositionAtCenterLine(result, {
                x: 0,
                y: this.pageHeight
            }, {
                x: 0,
                y: 0
            });
        }
        if (Math.abs(result.x - this.pageWidth) < 1 && Math.abs(result.y) < 1) {
            throw new Error('Point is too small');
        }
        return result;
    }
    updateAngleAndGeometry(pos) {
        this.angle = this.calculateAngle(pos);
        this.rect = this.getPageRect(pos);
    }
    calculateAngle(pos) {
        const left = this.pageWidth - pos.x + 1;
        const top = this.corner === (require("src/Flip/Flip").FlipCorner).BOTTOM ? this.pageHeight - pos.y : pos.y;
        let angle = 2 * Math.acos(left / Math.sqrt(top * top + left * left));
        if (top < 0) angle = -angle;
        const da = Math.PI - angle;
        if (!isFinite(angle) || da >= 0 && da < 0.003) throw new Error('The G point is too small');
        if (this.corner === (require("src/Flip/Flip").FlipCorner).BOTTOM) angle = -angle;
        return angle;
    }
    getPageRect(localPos) {
        if (this.corner === (require("src/Flip/Flip").FlipCorner).TOP) {
            return this.getRectFromBasePoint([
                {
                    x: 0,
                    y: 0
                },
                {
                    x: this.pageWidth,
                    y: 0
                },
                {
                    x: 0,
                    y: this.pageHeight
                },
                {
                    x: this.pageWidth,
                    y: this.pageHeight
                }
            ], localPos);
        }
        return this.getRectFromBasePoint([
            {
                x: 0,
                y: -this.pageHeight
            },
            {
                x: this.pageWidth,
                y: -this.pageHeight
            },
            {
                x: 0,
                y: 0
            },
            {
                x: this.pageWidth,
                y: 0
            }
        ], localPos);
    }
    getRectFromBasePoint(points, localPos) {
        return {
            topLeft: this.getRotatedPoint(points[0], localPos),
            topRight: this.getRotatedPoint(points[1], localPos),
            bottomLeft: this.getRotatedPoint(points[2], localPos),
            bottomRight: this.getRotatedPoint(points[3], localPos)
        };
    }
    getRotatedPoint(transformedPoint, startPoint) {
        return {
            x: transformedPoint.x * Math.cos(this.angle) + transformedPoint.y * Math.sin(this.angle) + startPoint.x,
            y: transformedPoint.y * Math.cos(this.angle) - transformedPoint.x * Math.sin(this.angle) + startPoint.y
        };
    }
    calculateIntersectPoint(pos) {
        const boundRect = {
            left: -1,
            top: -1,
            width: this.pageWidth + 2,
            height: this.pageHeight + 2
        };
        if (this.corner === (require("src/Flip/Flip").FlipCorner).TOP) {
            this.topIntersectPoint = (require("src/Helper").Helper).GetIntersectBetweenTwoSegment(boundRect, [
                pos,
                this.rect.topRight
            ], [
                {
                    x: 0,
                    y: 0
                },
                {
                    x: this.pageWidth,
                    y: 0
                }
            ]);
            this.sideIntersectPoint = (require("src/Helper").Helper).GetIntersectBetweenTwoSegment(boundRect, [
                pos,
                this.rect.bottomLeft
            ], [
                {
                    x: this.pageWidth,
                    y: 0
                },
                {
                    x: this.pageWidth,
                    y: this.pageHeight
                }
            ]);
            this.bottomIntersectPoint = (require("src/Helper").Helper).GetIntersectBetweenTwoSegment(boundRect, [
                this.rect.bottomLeft,
                this.rect.bottomRight
            ], [
                {
                    x: 0,
                    y: this.pageHeight
                },
                {
                    x: this.pageWidth,
                    y: this.pageHeight
                }
            ]);
        } else {
            this.topIntersectPoint = (require("src/Helper").Helper).GetIntersectBetweenTwoSegment(boundRect, [
                this.rect.topLeft,
                this.rect.topRight
            ], [
                {
                    x: 0,
                    y: 0
                },
                {
                    x: this.pageWidth,
                    y: 0
                }
            ]);
            this.sideIntersectPoint = (require("src/Helper").Helper).GetIntersectBetweenTwoSegment(boundRect, [
                pos,
                this.rect.topLeft
            ], [
                {
                    x: this.pageWidth,
                    y: 0
                },
                {
                    x: this.pageWidth,
                    y: this.pageHeight
                }
            ]);
            this.bottomIntersectPoint = (require("src/Helper").Helper).GetIntersectBetweenTwoSegment(boundRect, [
                this.rect.bottomLeft,
                this.rect.bottomRight
            ], [
                {
                    x: 0,
                    y: this.pageHeight
                },
                {
                    x: this.pageWidth,
                    y: this.pageHeight
                }
            ]);
        }
    }
    checkPositionAtCenterLine(checkedPos, centerOne, centerTwo) {
        let result = checkedPos;
        const tmp = (require("src/Helper").Helper).LimitPointToCircle(centerOne, this.pageWidth, result);
        if (result !== tmp) {
            result = tmp;
            this.updateAngleAndGeometry(result);
        }
        const rad = Math.sqrt(Math.pow(this.pageWidth, 2) + Math.pow(this.pageHeight, 2));
        let checkPointOne = this.rect.bottomRight;
        let checkPointTwo = this.rect.topLeft;
        if (this.corner === (require("src/Flip/Flip").FlipCorner).BOTTOM) {
            checkPointOne = this.rect.topRight;
            checkPointTwo = this.rect.bottomLeft;
        }
        if (checkPointOne.x <= 0) {
            const bottomPoint = (require("src/Helper").Helper).LimitPointToCircle(centerTwo, rad, checkPointTwo);
            if (bottomPoint !== result) {
                result = bottomPoint;
                this.updateAngleAndGeometry(result);
            }
        }
        return result;
    }
    getSegmentToShadowLine() {
        const first = this.getShadowStartPoint();
        const second = first !== this.sideIntersectPoint && this.sideIntersectPoint !== null ? this.sideIntersectPoint : this.bottomIntersectPoint;
        return [
            first,
            second
        ];
    }
}

},
"src/Helper":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"Helper",{get:()=>Helper});

class Helper {
    static GetDistanceBetweenTwoPoint(point1, point2) {
        if (point1 === null || point2 === null) {
            return Infinity;
        }
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
    static GetSegmentLength(segment) {
        return Helper.GetDistanceBetweenTwoPoint(segment[0], segment[1]);
    }
    static GetAngleBetweenTwoLine(line1, line2) {
        const A1 = line1[0].y - line1[1].y;
        const A2 = line2[0].y - line2[1].y;
        const B1 = line1[1].x - line1[0].x;
        const B2 = line2[1].x - line2[0].x;
        return Math.acos((A1 * A2 + B1 * B2) / (Math.sqrt(A1 * A1 + B1 * B1) * Math.sqrt(A2 * A2 + B2 * B2)));
    }
    static PointInRect(rect, pos) {
        if (pos === null) {
            return null;
        }
        if (pos.x >= rect.left && pos.x <= rect.width + rect.left && pos.y >= rect.top && pos.y <= rect.top + rect.height) {
            return pos;
        }
        return null;
    }
    static GetRotatedPoint(transformedPoint, startPoint, angle) {
        return {
            x: transformedPoint.x * Math.cos(angle) + transformedPoint.y * Math.sin(angle) + startPoint.x,
            y: transformedPoint.y * Math.cos(angle) - transformedPoint.x * Math.sin(angle) + startPoint.y
        };
    }
    static LimitPointToCircle(startPoint, radius, limitedPoint) {
        if (Helper.GetDistanceBetweenTwoPoint(startPoint, limitedPoint) <= radius) {
            return limitedPoint;
        }
        const a = startPoint.x;
        const b = startPoint.y;
        const n = limitedPoint.x;
        const m = limitedPoint.y;
        let x = Math.sqrt(Math.pow(radius, 2) * Math.pow(a - n, 2) / (Math.pow(a - n, 2) + Math.pow(b - m, 2))) + a;
        if (limitedPoint.x < 0) {
            x *= -1;
        }
        let y = (x - a) * (b - m) / (a - n) + b;
        if (a - n + b === 0) {
            y = radius;
        }
        return {
            x,
            y
        };
    }
    static GetIntersectBetweenTwoSegment(rectBorder, one, two) {
        return Helper.PointInRect(rectBorder, Helper.GetIntersectBeetwenTwoLine(one, two));
    }
    static GetIntersectBeetwenTwoLine(one, two) {
        const A1 = one[0].y - one[1].y;
        const A2 = two[0].y - two[1].y;
        const B1 = one[1].x - one[0].x;
        const B2 = two[1].x - two[0].x;
        const C1 = one[0].x * one[1].y - one[1].x * one[0].y;
        const C2 = two[0].x * two[1].y - two[1].x * two[0].y;
        const det1 = A1 * C2 - A2 * C1;
        const det2 = B1 * C2 - B2 * C1;
        const x = -((C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1));
        const y = -((A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1));
        if (isFinite(x) && isFinite(y)) {
            return {
                x,
                y
            };
        } else {
            if (Math.abs(det1 - det2) < 0.1) throw new Error('Segment included');
        }
        return null;
    }
    static GetCordsFromTwoPoint(pointOne, pointTwo) {
        const sizeX = Math.abs(pointOne.x - pointTwo.x);
        const sizeY = Math.abs(pointOne.y - pointTwo.y);
        const lengthLine = Math.max(sizeX, sizeY);
        const result = [
            pointOne
        ];
        function getCord(c1, c2, size, length, index) {
            if (c2 > c1) {
                return c1 + index * (size / length);
            } else if (c2 < c1) {
                return c1 - index * (size / length);
            }
            return c1;
        }
        for(let i = 1; i <= lengthLine; i += 1){
            result.push({
                x: getCord(pointOne.x, pointTwo.x, sizeX, lengthLine, i),
                y: getCord(pointOne.y, pointTwo.y, sizeY, lengthLine, i)
            });
        }
        return result;
    }
}

},
"src/Page/HTMLPage":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"HTMLPage",{get:()=>HTMLPage});





class HTMLPage extends (require("src/Page/Page").Page) {
    
    
    
    
    constructor(render, element, density){
        super(render, density);
        this.copiedElement = null;
        this.temporaryCopy = null;
        this.isLoad = false;

        this.element = element;
        this.element.classList.add('stf__item');
        this.element.classList.add('--' + density);
    }
    newTemporaryCopy() {
        if (this.nowDrawingDensity === (require("src/Page/Page").PageDensity).HARD) {
            return this;
        }
        if (this.temporaryCopy === null) {
            this.copiedElement = this.element.cloneNode(true);
            this.element.parentElement.appendChild(this.copiedElement);
            this.temporaryCopy = new HTMLPage(this.render, this.copiedElement, this.nowDrawingDensity);
        }
        return this.getTemporaryCopy();
    }
    getTemporaryCopy() {
        return this.temporaryCopy;
    }
    hideTemporaryCopy() {
        if (this.temporaryCopy !== null) {
            this.copiedElement.remove();
            this.copiedElement = null;
            this.temporaryCopy = null;
        }
    }
    draw(tempDensity) {
        const density = tempDensity ? tempDensity : this.nowDrawingDensity;
        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;
        this.element.classList.remove('--simple');
        const commonStyle = `
            display: block;
            z-index: ${this.element.style.zIndex};
            left: 0;
            top: 0;
            width: ${pageWidth}px;
            height: ${pageHeight}px;
        `;
        density === (require("src/Page/Page").PageDensity).HARD ? this.drawHard(commonStyle) : this.drawSoft(pagePos, commonStyle);
    }
    drawHard(commonStyle = '') {
        const pos = this.render.getRect().left + this.render.getRect().width / 2;
        const angle = this.state.hardDrawingAngle;
        const newStyle = commonStyle + `
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                clip-path: none;
                -webkit-clip-path: none;
            ` + (this.orientation === (require("src/Page/Page").PageOrientation).LEFT ? `transform-origin: ${this.render.getRect().pageWidth}px 0; 
                   transform: translate3d(0, 0, 0) rotateY(${angle}deg);` : `transform-origin: 0 0; 
                   transform: translate3d(${pos}px, 0, 0) rotateY(${angle}deg);`);
        this.element.style.cssText = newStyle;
    }
    drawSoft(position, commonStyle = '') {
        let polygon = 'polygon( ';
        for (const p of this.state.area){
            if (p !== null) {
                let g = this.render.getDirection() === (require("src/Flip/Flip").FlipDirection).BACK ? {
                    x: -p.x + this.state.position.x,
                    y: p.y - this.state.position.y
                } : {
                    x: p.x - this.state.position.x,
                    y: p.y - this.state.position.y
                };
                g = (require("src/Helper").Helper).GetRotatedPoint(g, {
                    x: 0,
                    y: 0
                }, this.state.angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        const newStyle = commonStyle + `transform-origin: 0 0; clip-path: ${polygon}; -webkit-clip-path: ${polygon};` + (this.render.isSafari() && this.state.angle === 0 ? `transform: translate(${position.x}px, ${position.y}px);` : `transform: translate3d(${position.x}px, ${position.y}px, 0) rotate(${this.state.angle}rad);`);
        this.element.style.cssText = newStyle;
    }
    simpleDraw(orient) {
        const rect = this.render.getRect();
        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;
        const x = orient === (require("src/Page/Page").PageOrientation).RIGHT ? rect.left + rect.pageWidth : rect.left;
        const y = rect.top;
        this.element.classList.add('--simple');
        this.element.style.cssText = `
            position: absolute; 
            display: block; 
            height: ${pageHeight}px; 
            left: ${x}px; 
            top: ${y}px; 
            width: ${pageWidth}px; 
            z-index: ${this.render.getSettings().startZIndex + 1};`;
    }
    getElement() {
        return this.element;
    }
    load() {
        this.isLoad = true;
    }
    setOrientation(orientation) {
        super.setOrientation(orientation);
        this.element.classList.remove('--left', '--right');
        this.element.classList.add(orientation === (require("src/Page/Page").PageOrientation).RIGHT ? '--right' : '--left');
    }
    setDrawingDensity(density) {
        this.element.classList.remove('--soft', '--hard');
        this.element.classList.add('--' + density);
        super.setDrawingDensity(density);
    }
}

},
"src/Page/ImagePage":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"ImagePage",{get:()=>ImagePage});




class ImagePage extends (require("src/Page/Page").Page) {
    
    
    
    constructor(render, href, density){
        super(render, density);
        this.image = null;
        this.isLoad = false;
        this.loadingAngle = 0;

        this.image = new Image();
        this.image.src = href;
    }
    draw(tempDensity) {
        const ctx = this.render.getContext();
        const pagePos = this.render.convertToGlobal(this.state.position);
        const pageWidth = this.render.getRect().pageWidth;
        const pageHeight = this.render.getRect().height;
        ctx.save();
        ctx.translate(pagePos.x, pagePos.y);
        ctx.beginPath();
        for (let p of this.state.area){
            if (p !== null) {
                p = this.render.convertToGlobal(p);
                ctx.lineTo(p.x - pagePos.x, p.y - pagePos.y);
            }
        }
        ctx.rotate(this.state.angle);
        ctx.clip();
        if (!this.isLoad) {
            this.drawLoader(ctx, {
                x: 0,
                y: 0
            }, pageWidth, pageHeight);
        } else {
            ctx.drawImage(this.image, 0, 0, pageWidth, pageHeight);
        }
        ctx.restore();
    }
    simpleDraw(orient) {
        const rect = this.render.getRect();
        const ctx = this.render.getContext();
        const pageWidth = rect.pageWidth;
        const pageHeight = rect.height;
        const x = orient === (require("src/Page/Page").PageOrientation).RIGHT ? rect.left + rect.pageWidth : rect.left;
        const y = rect.top;
        if (!this.isLoad) {
            this.drawLoader(ctx, {
                x,
                y
            }, pageWidth, pageHeight);
        } else {
            ctx.drawImage(this.image, x, y, pageWidth, pageHeight);
        }
    }
    drawLoader(ctx, shiftPos, pageWidth, pageHeight) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(200, 200, 200)';
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 1;
        ctx.rect(shiftPos.x + 1, shiftPos.y + 1, pageWidth - 1, pageHeight - 1);
        ctx.stroke();
        ctx.fill();
        const middlePoint = {
            x: shiftPos.x + pageWidth / 2,
            y: shiftPos.y + pageHeight / 2
        };
        ctx.beginPath();
        ctx.lineWidth = 10;
        ctx.arc(middlePoint.x, middlePoint.y, 20, this.loadingAngle, 3 * Math.PI / 2 + this.loadingAngle);
        ctx.stroke();
        ctx.closePath();
        this.loadingAngle += 0.07;
        if (this.loadingAngle >= 2 * Math.PI) {
            this.loadingAngle = 0;
        }
    }
    load() {
        if (!this.isLoad) this.image.onload = ()=>{
            this.isLoad = true;
        };
    }
    newTemporaryCopy() {
        return this;
    }
    getTemporaryCopy() {
        return this;
    }
    hideTemporaryCopy() {
        return;
    }
}

},
"src/Page/Page":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"PageOrientation",{get:()=>PageOrientation});
Object.defineProperty(exports,"PageDensity",{get:()=>PageDensity});
Object.defineProperty(exports,"Page",{get:()=>Page});


var PageOrientation = /*#__PURE__*/ function(PageOrientation) {
    PageOrientation[PageOrientation["LEFT"] = 0] = "LEFT";
    PageOrientation[PageOrientation["RIGHT"] = 1] = "RIGHT";
    return PageOrientation;
}({});
var PageDensity = /*#__PURE__*/ function(PageDensity) {
    PageDensity["SOFT"] = "soft";
    PageDensity["HARD"] = "hard";
    return PageDensity;
}({});
class Page {
    
    
    
    
    
    constructor(render, density){
        this.state = {
            angle: 0,
            area: [],
            position: {
                x: 0,
                y: 0
            },
            hardAngle: 0,
            hardDrawingAngle: 0
        };
        this.createdDensity = density;
        this.nowDrawingDensity = this.createdDensity;
        this.render = render;
    }
    setDensity(density) {
        this.createdDensity = density;
        this.nowDrawingDensity = density;
    }
    setDrawingDensity(density) {
        this.nowDrawingDensity = density;
    }
    setPosition(pagePos) {
        this.state.position = pagePos;
    }
    setAngle(angle) {
        this.state.angle = angle;
    }
    setArea(area) {
        this.state.area = area;
    }
    setHardDrawingAngle(angle) {
        this.state.hardDrawingAngle = angle;
    }
    setHardAngle(angle) {
        this.state.hardAngle = angle;
        this.state.hardDrawingAngle = angle;
    }
    setOrientation(orientation) {
        this.orientation = orientation;
    }
    getDrawingDensity() {
        return this.nowDrawingDensity;
    }
    getDensity() {
        return this.createdDensity;
    }
    getHardAngle() {
        return this.state.hardAngle;
    }
}

},
"src/PageFlip":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"PageFlip",{get:()=>PageFlip});
















class PageFlip extends (require("src/Event/EventObject").EventObject) {
    
    
    
    
    
    
    
    
    
    constructor(inBlock, setting){
        super();
        this.isUserTouch = false;
        this.isUserMove = false;
        this.setting = null;
        this.pages = null;

        this.setting = new (require("src/Settings").Settings)().getSettings(setting);
        this.block = inBlock;
    }
    destroy() {
        this.ui.destroy();
        this.block.remove();
    }
    update() {
        this.render.update();
        this.pages.show();
    }
    loadFromImages(imagesHref) {
        this.ui = new (require("src/UI/CanvasUI").CanvasUI)(this.block, this, this.setting);
        const canvas = this.ui.getCanvas();
        this.render = new (require("src/Render/CanvasRender").CanvasRender)(this, this.setting, canvas);
        this.flipController = new (require("src/Flip/Flip").Flip)(this.render, this);
        this.pages = new (require("src/Collection/ImagePageCollection").ImagePageCollection)(this, this.render, imagesHref);
        this.pages.load();
        this.render.start();
        this.pages.show(this.setting.startPage);
        setTimeout(()=>{
            this.ui.update();
            this.trigger('init', this, {
                page: this.setting.startPage,
                mode: this.render.getOrientation()
            });
        }, 1);
    }
    loadFromHTML(items) {
        this.ui = new (require("src/UI/HTMLUI").HTMLUI)(this.block, this, this.setting, items);
        this.render = new (require("src/Render/HTMLRender").HTMLRender)(this, this.setting, this.ui.getDistElement());
        this.flipController = new (require("src/Flip/Flip").Flip)(this.render, this);
        this.pages = new (require("src/Collection/HTMLPageCollection").HTMLPageCollection)(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();
        this.render.start();
        this.pages.show(this.setting.startPage);
        setTimeout(()=>{
            this.ui.update();
            this.trigger('init', this, {
                page: this.setting.startPage,
                mode: this.render.getOrientation()
            });
        }, 1);
    }
    updateFromImages(imagesHref) {
        const current = this.pages.getCurrentPageIndex();
        this.pages.destroy();
        this.pages = new (require("src/Collection/ImagePageCollection").ImagePageCollection)(this, this.render, imagesHref);
        this.pages.load();
        this.pages.show(current);
        this.trigger('update', this, {
            page: current,
            mode: this.render.getOrientation()
        });
    }
    updateFromHtml(items) {
        const current = this.pages.getCurrentPageIndex();
        this.pages.destroy();
        this.pages = new (require("src/Collection/HTMLPageCollection").HTMLPageCollection)(this, this.render, this.ui.getDistElement(), items);
        this.pages.load();
        this.ui.updateItems(items);
        this.render.reload();
        this.pages.show(current);
        this.trigger('update', this, {
            page: current,
            mode: this.render.getOrientation()
        });
    }
    clear() {
        this.pages.destroy();
        this.ui.clear();
    }
    turnToPrevPage() {
        this.pages.showPrev();
    }
    turnToNextPage() {
        this.pages.showNext();
    }
    turnToPage(page) {
        this.pages.show(page);
    }
    flipNext(corner = (require("src/Flip/Flip").FlipCorner).TOP) {
        this.flipController.flipNext(corner);
    }
    flipPrev(corner = (require("src/Flip/Flip").FlipCorner).TOP) {
        this.flipController.flipPrev(corner);
    }
    flip(page, corner = (require("src/Flip/Flip").FlipCorner).TOP) {
        this.flipController.flipToPage(page, corner);
    }
    updateState(newState) {
        this.trigger('changeState', this, newState);
    }
    updatePageIndex(newPage) {
        this.trigger('flip', this, newPage);
    }
    updateOrientation(newOrientation) {
        this.ui.setOrientationStyle(newOrientation);
        this.update();
        this.trigger('changeOrientation', this, newOrientation);
    }
    getPageCount() {
        return this.pages.getPageCount();
    }
    getCurrentPageIndex() {
        return this.pages.getCurrentPageIndex();
    }
    getPage(pageIndex) {
        return this.pages.getPage(pageIndex);
    }
    getRender() {
        return this.render;
    }
    getFlipController() {
        return this.flipController;
    }
    getOrientation() {
        return this.render.getOrientation();
    }
    getBoundsRect() {
        return this.render.getRect();
    }
    getSettings() {
        return this.setting;
    }
    getUI() {
        return this.ui;
    }
    getState() {
        return this.flipController.getState();
    }
    getPageCollection() {
        return this.pages;
    }
    startUserTouch(pos) {
        this.mousePosition = pos;
        this.isUserTouch = true;
        this.isUserMove = false;
    }
    userMove(pos, isTouch) {
        if (!this.isUserTouch && !isTouch && this.setting.showPageCorners) {
            this.flipController.showCorner(pos);
        } else if (this.isUserTouch) {
            if ((require("src/Helper").Helper).GetDistanceBetweenTwoPoint(this.mousePosition, pos) > 5) {
                this.isUserMove = true;
                this.flipController.fold(pos);
            }
        }
    }
    userStop(pos, isSwipe = false) {
        if (this.isUserTouch) {
            this.isUserTouch = false;
            if (!isSwipe) {
                if (!this.isUserMove) this.flipController.flip(pos);
                else this.flipController.stopMove();
            }
        }
    }
}

},
"src/Render/CanvasRender":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"CanvasRender",{get:()=>CanvasRender});





class CanvasRender extends (require("src/Render/Render").Render) {
    
    
    constructor(app, setting, inCanvas){
        super(app, setting);
        this.canvas = inCanvas;
        this.ctx = inCanvas.getContext('2d');
    }
    getContext() {
        return this.ctx;
    }
    reload() {}
    drawFrame() {
        this.clear();
        if (this.orientation !== (require("src/Render/Render").Orientation).PORTRAIT) {
            if (this.leftPage != null) this.leftPage.simpleDraw((require("src/Page/Page").PageOrientation).LEFT);
        }
        if (this.rightPage != null) this.rightPage.simpleDraw((require("src/Page/Page").PageOrientation).RIGHT);
        if (this.bottomPage != null) this.bottomPage.draw();
        this.drawBookShadow();
        if (this.flippingPage != null) this.flippingPage.draw();
        if (this.shadow != null) {
            this.drawOuterShadow();
            this.drawInnerShadow();
        }
        const rect = this.getRect();
        if (this.orientation === (require("src/Render/Render").Orientation).PORTRAIT) {
            this.ctx.beginPath();
            this.ctx.rect(rect.left + rect.pageWidth, rect.top, rect.width, rect.height);
            this.ctx.clip();
        }
    }
    drawBookShadow() {
        const rect = this.getRect();
        this.ctx.save();
        this.ctx.beginPath();
        const shadowSize = rect.width / 20;
        this.ctx.rect(rect.left, rect.top, rect.width, rect.height);
        const shadowPos = {
            x: rect.left + rect.width / 2 - shadowSize / 2,
            y: 0
        };
        this.ctx.translate(shadowPos.x, shadowPos.y);
        const outerGradient = this.ctx.createLinearGradient(0, 0, shadowSize, 0);
        outerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        outerGradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
        outerGradient.addColorStop(0.49, 'rgba(0, 0, 0, 0.1)');
        outerGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
        outerGradient.addColorStop(0.51, 'rgba(0, 0, 0, 0.4)');
        outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.clip();
        this.ctx.fillStyle = outerGradient;
        this.ctx.fillRect(0, 0, shadowSize, rect.height * 2);
        this.ctx.restore();
    }
    drawOuterShadow() {
        const rect = this.getRect();
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(rect.left, rect.top, rect.width, rect.height);
        const shadowPos = this.convertToGlobal({
            x: this.shadow.pos.x,
            y: this.shadow.pos.y
        });
        this.ctx.translate(shadowPos.x, shadowPos.y);
        this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);
        const outerGradient = this.ctx.createLinearGradient(0, 0, this.shadow.width, 0);
        if (this.shadow.direction === (require("src/Flip/Flip").FlipDirection).FORWARD) {
            this.ctx.translate(0, -100);
            outerGradient.addColorStop(0, 'rgba(0, 0, 0, ' + this.shadow.opacity + ')');
            outerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            this.ctx.translate(-this.shadow.width, -100);
            outerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            outerGradient.addColorStop(1, 'rgba(0, 0, 0, ' + this.shadow.opacity + ')');
        }
        this.ctx.clip();
        this.ctx.fillStyle = outerGradient;
        this.ctx.fillRect(0, 0, this.shadow.width, rect.height * 2);
        this.ctx.restore();
    }
    drawInnerShadow() {
        const rect = this.getRect();
        this.ctx.save();
        this.ctx.beginPath();
        const shadowPos = this.convertToGlobal({
            x: this.shadow.pos.x,
            y: this.shadow.pos.y
        });
        const pageRect = this.convertRectToGlobal(this.pageRect);
        this.ctx.moveTo(pageRect.topLeft.x, pageRect.topLeft.y);
        this.ctx.lineTo(pageRect.topRight.x, pageRect.topRight.y);
        this.ctx.lineTo(pageRect.bottomRight.x, pageRect.bottomRight.y);
        this.ctx.lineTo(pageRect.bottomLeft.x, pageRect.bottomLeft.y);
        this.ctx.translate(shadowPos.x, shadowPos.y);
        this.ctx.rotate(Math.PI + this.shadow.angle + Math.PI / 2);
        const isw = this.shadow.width * 3 / 4;
        const innerGradient = this.ctx.createLinearGradient(0, 0, isw, 0);
        if (this.shadow.direction === (require("src/Flip/Flip").FlipDirection).FORWARD) {
            this.ctx.translate(-isw, -100);
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, ' + this.shadow.opacity + ')');
            innerGradient.addColorStop(0.9, 'rgba(0, 0, 0, 0.05)');
            innerGradient.addColorStop(0.7, 'rgba(0, 0, 0, ' + this.shadow.opacity + ')');
            innerGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        } else {
            this.ctx.translate(0, -100);
            innerGradient.addColorStop(0, 'rgba(0, 0, 0, ' + this.shadow.opacity + ')');
            innerGradient.addColorStop(0.1, 'rgba(0, 0, 0, 0.05)');
            innerGradient.addColorStop(0.3, 'rgba(0, 0, 0, ' + this.shadow.opacity + ')');
            innerGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        this.ctx.clip();
        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(0, 0, isw, rect.height * 2);
        this.ctx.restore();
    }
    clear() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

},
"src/Render/HTMLRender":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"HTMLRender",{get:()=>HTMLRender});







class HTMLRender extends (require("src/Render/Render").Render) {
    
    
    
    
    
    
    constructor(app, setting, element){
        super(app, setting);
        this.outerShadow = null;
        this.innerShadow = null;
        this.hardShadow = null;
        this.hardInnerShadow = null;

        this.element = element;
        this.createShadows();
    }
    createShadows() {
        this.element.insertAdjacentHTML('beforeend', `<div class="stf__outerShadow"></div>
             <div class="stf__innerShadow"></div>
             <div class="stf__hardShadow"></div>
             <div class="stf__hardInnerShadow"></div>`);
        this.outerShadow = this.element.querySelector('.stf__outerShadow');
        this.innerShadow = this.element.querySelector('.stf__innerShadow');
        this.hardShadow = this.element.querySelector('.stf__hardShadow');
        this.hardInnerShadow = this.element.querySelector('.stf__hardInnerShadow');
    }
    clearShadow() {
        super.clearShadow();
        this.outerShadow.style.cssText = 'display: none';
        this.innerShadow.style.cssText = 'display: none';
        this.hardShadow.style.cssText = 'display: none';
        this.hardInnerShadow.style.cssText = 'display: none';
    }
    reload() {
        const testShadow = this.element.querySelector('.stf__outerShadow');
        if (!testShadow) {
            this.createShadows();
        }
    }
    drawHardInnerShadow() {
        const rect = this.getRect();
        const progress = this.shadow.progress > 100 ? 200 - this.shadow.progress : this.shadow.progress;
        let innerShadowSize = (100 - progress) * (2.5 * rect.pageWidth) / 100 + 20;
        if (innerShadowSize > rect.pageWidth) innerShadowSize = rect.pageWidth;
        let newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 5).toString(10)};
            width: ${innerShadowSize}px;
            height: ${rect.height}px;
            background: linear-gradient(to right,
                rgba(0, 0, 0, ${this.shadow.opacity * progress / 100}) 5%,
                rgba(0, 0, 0, 0) 100%);
            left: ${rect.left + rect.width / 2}px;
            transform-origin: 0 0;
        `;
        newStyle += this.getDirection() === (require("src/Flip/Flip").FlipDirection).FORWARD && this.shadow.progress > 100 || this.getDirection() === (require("src/Flip/Flip").FlipDirection).BACK && this.shadow.progress <= 100 ? `transform: translate3d(0, 0, 0);` : `transform: translate3d(0, 0, 0) rotateY(180deg);`;
        this.hardInnerShadow.style.cssText = newStyle;
    }
    drawHardOuterShadow() {
        const rect = this.getRect();
        const progress = this.shadow.progress > 100 ? 200 - this.shadow.progress : this.shadow.progress;
        let shadowSize = (100 - progress) * (2.5 * rect.pageWidth) / 100 + 20;
        if (shadowSize > rect.pageWidth) shadowSize = rect.pageWidth;
        let newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 4).toString(10)};
            width: ${shadowSize}px;
            height: ${rect.height}px;
            background: linear-gradient(to left, rgba(0, 0, 0, ${this.shadow.opacity}) 5%, rgba(0, 0, 0, 0) 100%);
            left: ${rect.left + rect.width / 2}px;
            transform-origin: 0 0;
        `;
        newStyle += this.getDirection() === (require("src/Flip/Flip").FlipDirection).FORWARD && this.shadow.progress > 100 || this.getDirection() === (require("src/Flip/Flip").FlipDirection).BACK && this.shadow.progress <= 100 ? `transform: translate3d(0, 0, 0) rotateY(180deg);` : `transform: translate3d(0, 0, 0);`;
        this.hardShadow.style.cssText = newStyle;
    }
    drawInnerShadow() {
        const rect = this.getRect();
        const innerShadowSize = this.shadow.width * 3 / 4;
        const shadowTranslate = this.getDirection() === (require("src/Flip/Flip").FlipDirection).FORWARD ? innerShadowSize : 0;
        const shadowDirection = this.getDirection() === (require("src/Flip/Flip").FlipDirection).FORWARD ? 'to left' : 'to right';
        const shadowPos = this.convertToGlobal(this.shadow.pos);
        const angle = this.shadow.angle + 3 * Math.PI / 2;
        const clip = [
            this.pageRect.topLeft,
            this.pageRect.topRight,
            this.pageRect.bottomRight,
            this.pageRect.bottomLeft
        ];
        let polygon = 'polygon( ';
        for (const p of clip){
            let g = this.getDirection() === (require("src/Flip/Flip").FlipDirection).BACK ? {
                x: -p.x + this.shadow.pos.x,
                y: p.y - this.shadow.pos.y
            } : {
                x: p.x - this.shadow.pos.x,
                y: p.y - this.shadow.pos.y
            };
            g = (require("src/Helper").Helper).GetRotatedPoint(g, {
                x: shadowTranslate,
                y: 100
            }, angle);
            polygon += g.x + 'px ' + g.y + 'px, ';
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        const newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 10).toString(10)};
            width: ${innerShadowSize}px;
            height: ${rect.height * 2}px;
            background: linear-gradient(${shadowDirection},
                rgba(0, 0, 0, ${this.shadow.opacity}) 5%,
                rgba(0, 0, 0, 0.05) 15%,
                rgba(0, 0, 0, ${this.shadow.opacity}) 35%,
                rgba(0, 0, 0, 0) 100%);
            transform-origin: ${shadowTranslate}px 100px;
            transform: translate3d(${shadowPos.x - shadowTranslate}px, ${shadowPos.y - 100}px, 0) rotate(${angle}rad);
            clip-path: ${polygon};
            -webkit-clip-path: ${polygon};
        `;
        this.innerShadow.style.cssText = newStyle;
    }
    drawOuterShadow() {
        const rect = this.getRect();
        const shadowPos = this.convertToGlobal({
            x: this.shadow.pos.x,
            y: this.shadow.pos.y
        });
        const angle = this.shadow.angle + 3 * Math.PI / 2;
        const shadowTranslate = this.getDirection() === (require("src/Flip/Flip").FlipDirection).BACK ? this.shadow.width : 0;
        const shadowDirection = this.getDirection() === (require("src/Flip/Flip").FlipDirection).FORWARD ? 'to right' : 'to left';
        const clip = [
            {
                x: 0,
                y: 0
            },
            {
                x: rect.pageWidth,
                y: 0
            },
            {
                x: rect.pageWidth,
                y: rect.height
            },
            {
                x: 0,
                y: rect.height
            }
        ];
        let polygon = 'polygon( ';
        for (const p of clip){
            if (p !== null) {
                let g = this.getDirection() === (require("src/Flip/Flip").FlipDirection).BACK ? {
                    x: -p.x + this.shadow.pos.x,
                    y: p.y - this.shadow.pos.y
                } : {
                    x: p.x - this.shadow.pos.x,
                    y: p.y - this.shadow.pos.y
                };
                g = (require("src/Helper").Helper).GetRotatedPoint(g, {
                    x: shadowTranslate,
                    y: 100
                }, angle);
                polygon += g.x + 'px ' + g.y + 'px, ';
            }
        }
        polygon = polygon.slice(0, -2);
        polygon += ')';
        const newStyle = `
            display: block;
            z-index: ${(this.getSettings().startZIndex + 10).toString(10)};
            width: ${this.shadow.width}px;
            height: ${rect.height * 2}px;
            background: linear-gradient(${shadowDirection}, rgba(0, 0, 0, ${this.shadow.opacity}), rgba(0, 0, 0, 0));
            transform-origin: ${shadowTranslate}px 100px;
            transform: translate3d(${shadowPos.x - shadowTranslate}px, ${shadowPos.y - 100}px, 0) rotate(${angle}rad);
            clip-path: ${polygon};
            -webkit-clip-path: ${polygon};
        `;
        this.outerShadow.style.cssText = newStyle;
    }
    drawLeftPage() {
        if (this.orientation === (require("src/Render/Render").Orientation).PORTRAIT || this.leftPage === null) return;
        if (this.direction === (require("src/Flip/Flip").FlipDirection).BACK && this.flippingPage !== null && this.flippingPage.getDrawingDensity() === (require("src/Page/Page").PageDensity).HARD) {
            this.leftPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(10);
            this.leftPage.setHardDrawingAngle(180 + this.flippingPage.getHardAngle());
            this.leftPage.draw(this.flippingPage.getDrawingDensity());
        } else {
            this.leftPage.simpleDraw((require("src/Page/Page").PageOrientation).LEFT);
        }
    }
    drawRightPage() {
        if (this.rightPage === null) return;
        if (this.direction === (require("src/Flip/Flip").FlipDirection).FORWARD && this.flippingPage !== null && this.flippingPage.getDrawingDensity() === (require("src/Page/Page").PageDensity).HARD) {
            this.rightPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(10);
            this.rightPage.setHardDrawingAngle(180 + this.flippingPage.getHardAngle());
            this.rightPage.draw(this.flippingPage.getDrawingDensity());
        } else {
            this.rightPage.simpleDraw((require("src/Page/Page").PageOrientation).RIGHT);
        }
    }
    drawBottomPage() {
        if (this.bottomPage === null) return;
        const tempDensity = this.flippingPage != null ? this.flippingPage.getDrawingDensity() : null;
        if (!(this.orientation === (require("src/Render/Render").Orientation).PORTRAIT && this.direction === (require("src/Flip/Flip").FlipDirection).BACK)) {
            this.bottomPage.getElement().style.zIndex = (this.getSettings().startZIndex + 3).toString(10);
            this.bottomPage.draw(tempDensity);
        }
    }
    drawFrame() {
        this.clear();
        this.drawLeftPage();
        this.drawRightPage();
        this.drawBottomPage();
        if (this.flippingPage != null) {
            this.flippingPage.getElement().style.zIndex = (this.getSettings().startZIndex + 5).toString(10);
            this.flippingPage.draw();
        }
        if (this.shadow != null && this.flippingPage !== null) {
            if (this.flippingPage.getDrawingDensity() === (require("src/Page/Page").PageDensity).SOFT) {
                this.drawOuterShadow();
                this.drawInnerShadow();
            } else {
                this.drawHardOuterShadow();
                this.drawHardInnerShadow();
            }
        }
    }
    clear() {
        for (const page of this.app.getPageCollection().getPages()){
            if (page !== this.leftPage && page !== this.rightPage && page !== this.flippingPage && page !== this.bottomPage) {
                page.getElement().style.cssText = 'display: none';
            }
            if (page.getTemporaryCopy() !== this.flippingPage) {
                page.hideTemporaryCopy();
            }
        }
    }
    update() {
        super.update();
        if (this.rightPage !== null) {
            this.rightPage.setOrientation((require("src/Page/Page").PageOrientation).RIGHT);
        }
        if (this.leftPage !== null) {
            this.leftPage.setOrientation((require("src/Page/Page").PageOrientation).LEFT);
        }
    }
}

},
"src/Render/Render":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"Orientation",{get:()=>Orientation});
Object.defineProperty(exports,"Render",{get:()=>Render});





var Orientation = /*#__PURE__*/ function(Orientation) {
    Orientation["PORTRAIT"] = "portrait";
    Orientation["LANDSCAPE"] = "landscape";
    return Orientation;
}({});
class Render {
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    constructor(app, setting){
        this.leftPage = null;
        this.rightPage = null;
        this.flippingPage = null;
        this.bottomPage = null;
        this.direction = null;
        this.orientation = null;
        this.shadow = null;
        this.animation = null;
        this.pageRect = null;
        this.boundsRect = null;
        this.timer = 0;
        this.safari = false;

        this.setting = setting;
        this.app = app;
        const regex = new RegExp('Version\\/[\\d\\.]+.*Safari/');
        this.safari = regex.exec(window.navigator.userAgent) !== null;
    }
    render(timer) {
        if (this.animation !== null) {
            const frameIndex = Math.round((timer - this.animation.startedAt) / this.animation.durationFrame);
            if (frameIndex < this.animation.frames.length) {
                this.animation.frames[frameIndex]();
            } else {
                this.animation.onAnimateEnd();
                this.animation = null;
            }
        }
        this.timer = timer;
        this.drawFrame();
    }
    start() {
        this.update();
        const loop = (timer)=>{
            this.render(timer);
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    startAnimation(frames, duration, onAnimateEnd) {
        this.finishAnimation();
        this.animation = {
            frames,
            duration,
            durationFrame: duration / frames.length,
            onAnimateEnd,
            startedAt: this.timer
        };
    }
    finishAnimation() {
        if (this.animation !== null) {
            this.animation.frames[this.animation.frames.length - 1]();
            if (this.animation.onAnimateEnd !== null) {
                this.animation.onAnimateEnd();
            }
        }
        this.animation = null;
    }
    update() {
        this.boundsRect = null;
        const orientation = this.calculateBoundsRect();
        if (this.orientation !== orientation) {
            this.orientation = orientation;
            this.app.updateOrientation(orientation);
        }
    }
    calculateBoundsRect() {
        let orientation = "landscape";
        const blockWidth = this.getBlockWidth();
        const middlePoint = {
            x: blockWidth / 2,
            y: this.getBlockHeight() / 2
        };
        const ratio = this.setting.width / this.setting.height;
        let pageWidth = this.setting.width;
        let pageHeight = this.setting.height;
        let left = middlePoint.x - pageWidth;
        if (this.setting.size === (require("src/Settings").SizeType).STRETCH) {
            if (blockWidth < this.setting.minWidth * 2 && this.app.getSettings().usePortrait) orientation = "portrait";
            pageWidth = orientation === "portrait" ? this.getBlockWidth() : this.getBlockWidth() / 2;
            if (pageWidth > this.setting.maxWidth) pageWidth = this.setting.maxWidth;
            pageHeight = pageWidth / ratio;
            if (pageHeight > this.getBlockHeight()) {
                pageHeight = this.getBlockHeight();
                pageWidth = pageHeight * ratio;
            }
            left = orientation === "portrait" ? middlePoint.x - pageWidth / 2 - pageWidth : middlePoint.x - pageWidth;
        } else {
            if (blockWidth < pageWidth * 2) {
                if (this.app.getSettings().usePortrait) {
                    orientation = "portrait";
                    left = middlePoint.x - pageWidth / 2 - pageWidth;
                }
            }
        }
        this.boundsRect = {
            left,
            top: middlePoint.y - pageHeight / 2,
            width: pageWidth * 2,
            height: pageHeight,
            pageWidth: pageWidth
        };
        return orientation;
    }
    setShadowData(pos, angle, progress, direction) {
        if (!this.app.getSettings().drawShadow) return;
        const maxShadowOpacity = 100 * this.getSettings().maxShadowOpacity;
        this.shadow = {
            pos,
            angle,
            width: this.getRect().pageWidth * 3 / 4 * progress / 100,
            opacity: (100 - progress) * maxShadowOpacity / 100 / 100,
            direction,
            progress: progress * 2
        };
    }
    clearShadow() {
        this.shadow = null;
    }
    getBlockWidth() {
        return this.app.getUI().getDistElement().offsetWidth;
    }
    getBlockHeight() {
        return this.app.getUI().getDistElement().offsetHeight;
    }
    getDirection() {
        return this.direction;
    }
    getRect() {
        if (this.boundsRect === null) this.calculateBoundsRect();
        return this.boundsRect;
    }
    getSettings() {
        return this.app.getSettings();
    }
    getOrientation() {
        return this.orientation;
    }
    setPageRect(pageRect) {
        this.pageRect = pageRect;
    }
    setDirection(direction) {
        this.direction = direction;
    }
    setRightPage(page) {
        if (page !== null) page.setOrientation((require("src/Page/Page").PageOrientation).RIGHT);
        this.rightPage = page;
    }
    setLeftPage(page) {
        if (page !== null) page.setOrientation((require("src/Page/Page").PageOrientation).LEFT);
        this.leftPage = page;
    }
    setBottomPage(page) {
        if (page !== null) page.setOrientation(this.direction === (require("src/Flip/Flip").FlipDirection).BACK ? (require("src/Page/Page").PageOrientation).LEFT : (require("src/Page/Page").PageOrientation).RIGHT);
        this.bottomPage = page;
    }
    setFlippingPage(page) {
        if (page !== null) page.setOrientation(this.direction === (require("src/Flip/Flip").FlipDirection).FORWARD && this.orientation !== "portrait" ? (require("src/Page/Page").PageOrientation).LEFT : (require("src/Page/Page").PageOrientation).RIGHT);
        this.flippingPage = page;
    }
    convertToBook(pos) {
        const rect = this.getRect();
        return {
            x: pos.x - rect.left,
            y: pos.y - rect.top
        };
    }
    isSafari() {
        return this.safari;
    }
    convertToPage(pos, direction) {
        if (!direction) direction = this.direction;
        const rect = this.getRect();
        const x = direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? pos.x - rect.left - rect.width / 2 : rect.width / 2 - pos.x + rect.left;
        return {
            x,
            y: pos.y - rect.top
        };
    }
    convertToGlobal(pos, direction) {
        if (!direction) direction = this.direction;
        if (pos == null) return null;
        const rect = this.getRect();
        const x = direction === (require("src/Flip/Flip").FlipDirection).FORWARD ? pos.x + rect.left + rect.width / 2 : rect.width / 2 - pos.x + rect.left;
        return {
            x,
            y: pos.y + rect.top
        };
    }
    convertRectToGlobal(rect, direction) {
        if (!direction) direction = this.direction;
        return {
            topLeft: this.convertToGlobal(rect.topLeft, direction),
            topRight: this.convertToGlobal(rect.topRight, direction),
            bottomLeft: this.convertToGlobal(rect.bottomLeft, direction),
            bottomRight: this.convertToGlobal(rect.bottomRight, direction)
        };
    }
}

},
"src/Settings":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"SizeType",{get:()=>SizeType});
Object.defineProperty(exports,"Settings",{get:()=>Settings});
var SizeType = /*#__PURE__*/ function(SizeType) {
    SizeType["FIXED"] = "fixed";
    SizeType["STRETCH"] = "stretch";
    return SizeType;
}({});
class Settings {
    constructor() { this._default = {
        startPage: 0,
        size: "fixed",
        width: 0,
        height: 0,
        minWidth: 0,
        maxWidth: 0,
        minHeight: 0,
        maxHeight: 0,
        drawShadow: true,
        flippingTime: 1000,
        usePortrait: true,
        startZIndex: 0,
        autoSize: true,
        maxShadowOpacity: 1,
        showCover: false,
        mobileScrollSupport: true,
        swipeDistance: 30,
        clickEventForward: true,
        useMouseEvents: true,
        showPageCorners: true,
        disableFlipByClick: false
    }; }

    
    getSettings(userSetting) {
        const result = this._default;
        Object.assign(result, userSetting);
        if (result.size !== "stretch" && result.size !== "fixed") throw new Error('Invalid size type. Available only "fixed" and "stretch" value');
        if (result.width <= 0 || result.height <= 0) throw new Error('Invalid width or height');
        if (result.flippingTime <= 0) throw new Error('Invalid flipping time');
        if (result.size === "stretch") {
            if (result.minWidth <= 0) result.minWidth = 100;
            if (result.maxWidth < result.minWidth) result.maxWidth = 2000;
            if (result.minHeight <= 0) result.minHeight = 100;
            if (result.maxHeight < result.minHeight) result.maxHeight = 2000;
        } else {
            result.minWidth = result.width;
            result.maxWidth = result.width;
            result.minHeight = result.height;
            result.maxHeight = result.height;
        }
        return result;
    }
}

},
"src/UI/CanvasUI":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"CanvasUI",{get:()=>CanvasUI});



class CanvasUI extends (require("src/UI/UI").UI) {
    
    constructor(inBlock, app, setting){
        super(inBlock, app, setting);
        this.wrapper.innerHTML = '<canvas class="stf__canvas"></canvas>';
        this.canvas = inBlock.querySelectorAll('canvas')[0];
        this.distElement = this.canvas;
        this.resizeCanvas();
        this.setHandlers();
    }
    resizeCanvas() {
        const cs = getComputedStyle(this.canvas);
        const width = parseInt(cs.getPropertyValue('width'), 10);
        const height = parseInt(cs.getPropertyValue('height'), 10);
        this.canvas.width = width;
        this.canvas.height = height;
    }
    getCanvas() {
        return this.canvas;
    }
    update() {
        this.resizeCanvas();
        this.app.getRender().update();
    }
}

},
"src/UI/HTMLUI":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"HTMLUI",{get:()=>HTMLUI});



class HTMLUI extends (require("src/UI/UI").UI) {
    
    constructor(inBlock, app, setting, items){
        super(inBlock, app, setting);
        this.wrapper.insertAdjacentHTML('afterbegin', '<div class="stf__block"></div>');
        this.distElement = inBlock.querySelector('.stf__block');
        this.items = items;
        for (const item of items){
            this.distElement.appendChild(item);
        }
        this.setHandlers();
    }
    clear() {
        for (const item of this.items){
            this.parentElement.appendChild(item);
        }
    }
    updateItems(items) {
        this.removeHandlers();
        this.distElement.innerHTML = '';
        for (const item of items){
            this.distElement.appendChild(item);
        }
        this.items = items;
        this.setHandlers();
    }
    update() {
        this.app.getRender().update();
    }
}

},
"src/UI/UI":function(module,exports,require){
"use strict";
Object.defineProperty(exports,"UI",{get:()=>UI});





class UI {
    
    
    
    
    
    
    
    
    constructor(inBlock, app, setting){
        this.touchPoint = null;
        this.swipeTimeout = 250;
        this.onResize = ()=>{
        this.update();
    };
        this.onMouseDown = (e)=>{
        if (this.checkTarget(e.target)) {
            const pos = this.getMousePos(e.clientX, e.clientY);
            this.app.startUserTouch(pos);
            e.preventDefault();
        }
    };
        this.onTouchStart = (e)=>{
        if (this.checkTarget(e.target)) {
            if (e.changedTouches.length > 0) {
                const t = e.changedTouches[0];
                const pos = this.getMousePos(t.clientX, t.clientY);
                this.touchPoint = {
                    point: pos,
                    time: Date.now()
                };
                setTimeout(()=>{
                    if (this.touchPoint !== null) {
                        this.app.startUserTouch(pos);
                    }
                }, this.swipeTimeout);
                if (!this.app.getSettings().mobileScrollSupport) e.preventDefault();
            }
        }
    };
        this.onMouseUp = (e)=>{
        const pos = this.getMousePos(e.clientX, e.clientY);
        this.app.userStop(pos);
    };
        this.onMouseMove = (e)=>{
        const pos = this.getMousePos(e.clientX, e.clientY);
        this.app.userMove(pos, false);
    };
        this.onTouchMove = (e)=>{
        if (e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const pos = this.getMousePos(t.clientX, t.clientY);
            if (this.app.getSettings().mobileScrollSupport) {
                if (this.touchPoint !== null) {
                    if (Math.abs(this.touchPoint.point.x - pos.x) > 10 || this.app.getState() !== (require("src/Flip/Flip").FlippingState).READ) {
                        if (e.cancelable) this.app.userMove(pos, true);
                    }
                }
                if (this.app.getState() !== (require("src/Flip/Flip").FlippingState).READ) {
                    e.preventDefault();
                }
            } else {
                this.app.userMove(pos, true);
            }
        }
    };
        this.onTouchEnd = (e)=>{
        if (e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const pos = this.getMousePos(t.clientX, t.clientY);
            let isSwipe = false;
            if (this.touchPoint !== null) {
                const dx = pos.x - this.touchPoint.point.x;
                const distY = Math.abs(pos.y - this.touchPoint.point.y);
                if (Math.abs(dx) > this.swipeDistance && distY < this.swipeDistance * 2 && Date.now() - this.touchPoint.time < this.swipeTimeout) {
                    if (dx > 0) {
                        this.app.flipPrev(this.touchPoint.point.y < this.app.getRender().getRect().height / 2 ? (require("src/Flip/Flip").FlipCorner).TOP : (require("src/Flip/Flip").FlipCorner).BOTTOM);
                    } else {
                        this.app.flipNext(this.touchPoint.point.y < this.app.getRender().getRect().height / 2 ? (require("src/Flip/Flip").FlipCorner).TOP : (require("src/Flip/Flip").FlipCorner).BOTTOM);
                    }
                    isSwipe = true;
                }
                this.touchPoint = null;
            }
            this.app.userStop(pos, isSwipe);
        }
    };

        this.parentElement = inBlock;
        inBlock.classList.add('stf__parent');
        inBlock.insertAdjacentHTML('afterbegin', '<div class="stf__wrapper"></div>');
        this.wrapper = inBlock.querySelector('.stf__wrapper');
        this.app = app;
        const k = this.app.getSettings().usePortrait ? 1 : 2;
        inBlock.style.minWidth = setting.minWidth * k + 'px';
        inBlock.style.minHeight = setting.minHeight + 'px';
        if (setting.size === (require("src/Settings").SizeType).FIXED) {
            inBlock.style.minWidth = setting.width * k + 'px';
            inBlock.style.minHeight = setting.height + 'px';
        }
        if (setting.autoSize) {
            inBlock.style.width = '100%';
            inBlock.style.maxWidth = setting.maxWidth * 2 + 'px';
        }
        inBlock.style.display = 'block';
        window.addEventListener('resize', this.onResize, false);
        this.swipeDistance = setting.swipeDistance;
    }
    destroy() {
        if (this.app.getSettings().useMouseEvents) this.removeHandlers();
        this.distElement.remove();
        this.wrapper.remove();
    }
    getDistElement() {
        return this.distElement;
    }
    getWrapper() {
        return this.wrapper;
    }
    setOrientationStyle(orientation) {
        this.wrapper.classList.remove('--portrait', '--landscape');
        if (orientation === (require("src/Render/Render").Orientation).PORTRAIT) {
            if (this.app.getSettings().autoSize) this.wrapper.style.paddingBottom = this.app.getSettings().height / this.app.getSettings().width * 100 + '%';
            this.wrapper.classList.add('--portrait');
        } else {
            if (this.app.getSettings().autoSize) this.wrapper.style.paddingBottom = this.app.getSettings().height / (this.app.getSettings().width * 2) * 100 + '%';
            this.wrapper.classList.add('--landscape');
        }
        this.update();
    }
    removeHandlers() {
        window.removeEventListener('resize', this.onResize);
        this.distElement.removeEventListener('mousedown', this.onMouseDown);
        this.distElement.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('touchend', this.onTouchEnd);
    }
    setHandlers() {
        window.addEventListener('resize', this.onResize, false);
        if (!this.app.getSettings().useMouseEvents) return;
        this.distElement.addEventListener('mousedown', this.onMouseDown);
        this.distElement.addEventListener('touchstart', this.onTouchStart);
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('touchmove', this.onTouchMove, {
            passive: !this.app.getSettings().mobileScrollSupport
        });
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('touchend', this.onTouchEnd);
    }
    getMousePos(x, y) {
        const rect = this.distElement.getBoundingClientRect();
        return {
            x: x - rect.left,
            y: y - rect.top
        };
    }
    checkTarget(targer) {
        if (!this.app.getSettings().clickEventForward) return true;
        if ([
            'a',
            'button'
        ].includes(targer.tagName.toLowerCase())) {
            return false;
        }
        return true;
    }
    
    
    
    
    
    
}

}
},cache={};
function require(id){if(cache[id])return cache[id].exports;const module=cache[id]={exports:{}};factories[id](module,module.exports,require);return module.exports;}
const style=document.createElement("style");style.textContent=".stf__parent {\n  position: relative;\n  display: block;\n  box-sizing: border-box;\n  transform: translateZ(0);\n\n  -ms-touch-action: pan-y;\n  touch-action: pan-y;\n}\n\n.sft__wrapper {\n  position: relative;\n  width: 100%;\n  box-sizing: border-box;\n}\n\n.stf__parent canvas {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  left: 0;\n  top: 0;\n}\n\n.stf__block {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  box-sizing: border-box;\n  perspective: 2000px;\n}\n\n.stf__item {\n  display: none;\n  position: absolute;\n  transform-style: preserve-3d;\n}\n\n.stf__outerShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.stf__innerShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.stf__hardShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n\n.stf__hardInnerShadow {\n  position: absolute;\n  left: 0;\n  top: 0;\n}\n";document.head.appendChild(style);
host.St={PageFlip:require("src/PageFlip").PageFlip};})(window);
