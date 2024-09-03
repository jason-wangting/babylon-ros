import { Context } from "../context"
import { LogLevel } from "../log"
import { LoaderContext } from "./context"
import { EElement } from "./element"
import { Link } from "./link"
import * as SourceLoader from "./source"
import { Triangles } from "./triangles"
import * as Utils from "./utils"
import { Vertices } from "./vertices"

    export class Geometry extends EElement {
        sources: SourceLoader.Source[];
        vertices: Vertices[];
        triangles: Triangles[];

        constructor() {
            super();
            this._className += "Geometry|";
            this.sources = [];
            this.vertices = [];
            this.triangles = [];
        }

        static fromLink(link: Link, context: Context): Geometry | undefined{
            return EElement._fromLink<Geometry>(link, "Geometry", context);
        }

        /**
        *   Parses a <geometry> element
        */
        static parse(node: Node, context: LoaderContext): Geometry {
            var result: Geometry = new Geometry();

            result.id = context.getAttributeAsString(node, "id", undefined, true);
            result.name = context.getAttributeAsString(node, "name", undefined, false);
            context.registerUrlTarget(result, true);

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "mesh":
                        Geometry.parseMesh(child, result, context);
                        break;
                    case "convex_mesh":
                    case "spline":
                        context.log.write("Geometry type " + child.nodeName + " not supported.", LogLevel.Error);
                        break;
                    case "extra":
                        Geometry.parseGeometryExtra(child, result, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });

            return result;
        }

        /**
        *   Parses a <geometry>/<mesh> element
        */
        static parseMesh(node: Node, geometry: Geometry, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "source":
                        geometry.sources.push(SourceLoader.Source.parse(child, context));
                        break;
                    case "vertices":
                        geometry.vertices.push(Vertices.parse(child, context));
                        break;
                    case "triangles":
                    case "polylist":
                    case "polygons":
                        geometry.triangles.push(Triangles.parse(child, context));
                        break;
                    case "lines":
                    case "linestrips":
                    case "trifans":
                    case "tristrips":
                        context.log.write("Geometry primitive type " + child.nodeName + " not supported.", LogLevel.Error);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }

        /**
        *   Parses a <geometry>/<extra> element
        */
        static parseGeometryExtra(node: Node, geometry: Geometry, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "technique":
                        var profile: string = context.getAttributeAsString(child, "profile", undefined, true);
                        Geometry.parseGeometryExtraTechnique(child, geometry, profile, context);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                }
            });
        }

        /**
        *   Parses a <geometry>/<extra>/<technique> element
        */
        static parseGeometryExtraTechnique(node: Node, geometry: Geometry, profile: string, context: LoaderContext) {
            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    default:
                        context.reportUnhandledChild(child);
                }
            });
        }
    };


    export class GeometryLibrary extends EElement {
        children: Geometry[] = [];

        static parse(node: Node, context: LoaderContext): GeometryLibrary {
            var result: GeometryLibrary = new GeometryLibrary();

            Utils.forEachChild(node, function (child: Node) {
                switch (child.nodeName) {
                    case "geometry":
                        result.children.push(Geometry.parse(child, context));
                        break;
                    case "extra":
                        context.reportUnhandledChild(child);
                        break;
                    default:
                        context.reportUnexpectedChild(child);
                        break;
                }
            });

            return result;
        }
    }
