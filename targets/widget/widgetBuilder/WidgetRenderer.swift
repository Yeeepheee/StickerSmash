import SwiftUI

struct WidgetRenderer: View {
    @Environment(\.widgetContentMargins) var margins
    let schema: WidgetSchema
    let images: [String: Data]
    let remoteData: [String: NodeOverride]

    var body: some View {
        let backgroundNode = schema.children.first { $0.isBackground }
        let foregroundNodes = schema.children.filter { !$0.isBackground }
        let rootAlignment: Alignment = schema.layout == "hstack" ? .leading : .topLeading

        Color.clear
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .overlay(alignment: rootAlignment) {
                renderLayout(
                    layout: schema.layout,
                    children: foregroundNodes,
                    spacing: schema.spacing
                )
                .padding(margins)
            }
            .clipped()
            .containerBackground(for: .widget) {
                renderBackgroundLayer(node: backgroundNode)
            }
    }

    // MARK: - Layout Rendering (Type-Erased to fix Opaque Type Error)

    func renderLayout(layout: String, children: [WidgetNode], spacing: Double? = nil) -> some View {
        let gap = CGFloat(spacing ?? 0)

        return AnyView(Group {
            switch layout {
            case "hstack":
                HStack(alignment: .center, spacing: gap) {
                    ForEach(children) { node in renderNodeWithAlignment(node, inHStack: true) }
                }
            case "zstack":
                ZStack(alignment: .topLeading) {
                    ForEach(children) { node in renderNodeWithAlignment(node, inZStack: true) }
                }
            default: // vstack
                VStack(alignment: .leading, spacing: gap) {
                    ForEach(children) { node in renderNodeWithAlignment(node) }
                }
            }
        })
    }

    // MARK: - Node Logic

    @ViewBuilder
    func renderNodeWithAlignment(_ node: WidgetNode, inZStack: Bool = false, inHStack: Bool = false) -> some View {
        let override = resolveOverride(for: node)
        let isHidden = override?.hidden ?? nodeHidden(node)

        if !isHidden {
            let fixedW = containerFixedWidth(node)
            let fixedH = containerFixedHeight(node)

            let hasExplicitAlignment: Bool = {
                if case .container(let c) = node {
                    return c.alignment != nil
                }
                return false
            }()

            let maxW: CGFloat? = inZStack ? .infinity : (fixedW != nil ? nil : (inHStack ? nil : .infinity))
            let maxH: CGFloat? = inZStack ? .infinity : (fixedH != nil ? nil : (hasExplicitAlignment ? .infinity : nil))

            let align = resolveAlignment(for: node, override: override)

            
            let needsPinToTop: Bool = {
                if fixedH != nil, case .container(let c) = node {
                    let isVStack = (c.layout ?? "vstack") == "vstack"
                    let isCentered = c.contentAlignment == "center"
                    return isVStack && !isCentered
                }
                return false
            }()

            let innerContent = buildInnerContent(node, override: override, pinToTop: needsPinToTop)
                .frame(width: fixedW, height: fixedH)

            if inZStack {
                let decorated = applyDecorations(to: innerContent, node: node, override: override)
                applyFlexFrame(view: decorated, maxWidth: maxW, maxHeight: maxH, alignment: align)
            } else {
                let sizedContent = applyFlexFrame(view: innerContent, maxWidth: maxW, maxHeight: maxH, alignment: align)
                applyDecorations(to: sizedContent, node: node, override: override)
            }
        }
    }

    @ViewBuilder
    private func buildInnerContent(_ node: WidgetNode, override: NodeOverride?, pinToTop: Bool = false) -> some View {
        switch node {
        case .text(let n):
            renderText(n, override: override)
        case .spacer(let s):
            if let w = s.width {
                AnyView(Color.clear.frame(width: CGFloat(w), height: 0))
            } else {
                AnyView(Spacer())
            }
        case .image(let n):
            renderImage(n, override: override)
        case .container(let n):
            
            let inner = renderLayout(layout: n.layout ?? "vstack", children: n.children, spacing: n.spacing)
                .padding(resolvedPadding(for: n))
            if pinToTop {
                VStack(spacing: 0) {
                    inner
                    Spacer(minLength: 0)
                }
            } else {
                inner
            }
        }
    }

    // MARK: - Styling & Decorations

    @ViewBuilder
    private func applyDecorations<V: View>(to view: V, node: WidgetNode, override: NodeOverride?) -> some View {
        let opacity = override?.opacity ?? nodeOpacity(node)
        let linkStr = override?.link ?? getLink(for: node)

        let styled = Group {
            if case .container(let c) = node {
                let bg = override?.backgroundColor ?? c.backgroundColor
                view.background(backgroundFill(bg))
                    .clipShape(RoundedRectangle(cornerRadius: CGFloat(c.cornerRadius ?? 0)))
            } else {
                view
            }
        }

        styled.opacity(opacity)
              .modifier(DeepLinkModifier(link: linkStr))
    }

    // MARK: - Helpers (Backgrounds, Images, Colors)

    @ViewBuilder
    private func renderBackgroundLayer(node: WidgetNode?) -> some View {
        let override = resolveOverride(for: node)
        ZStack {
            backgroundFill(override?.backgroundColor ?? schema.backgroundColor)
            if let node = node, case .image(let img) = node {
                let src = override?.src ?? img.src
                if let data = images[src], let ui = UIImage(data: data) {
                    Image(uiImage: ui).resizable().scaledToFill()
                }
            }
        }
    }

    @ViewBuilder
    private func backgroundFill(_ hex: String?) -> some View {
        if let hex = hex, hex.lowercased() != "transparent" {
            Color(hex: hex)
        } else {
            Color.clear
        }
    }

    @ViewBuilder
    private func renderText(_ node: TextNode, override: NodeOverride?) -> some View {
        let value = override?.value ?? node.value
        let color = override?.color ?? node.color ?? "#000000"
        Text(value)
            .font(.system(size: CGFloat(override?.fontSize ?? node.fontSize ?? 16),
                          weight: fontWeightValue(override?.fontWeight ?? node.fontWeight ?? "regular")))
            .foregroundColor(Color(hex: color))
            .multilineTextAlignment(getTextAlignment(from: override?.textAlignment ?? node.textAlignment))
    }

    @ViewBuilder
    private func renderImage(_ node: ImageNode, override: NodeOverride?) -> some View {
        let src = override?.src ?? node.src
        if let data = images[src], let ui = UIImage(data: data) {
            let w = CGFloat(override?.width ?? node.width ?? 50)
            let img = Image(uiImage: ui).resizable()
                .aspectRatio(contentMode: node.contentMode == "fill" ? .fill : .fit)
            
            if let hValue = override?.height ?? node.height {
                
                img.frame(width: w, height: CGFloat(hValue)).clipped()
            } else {
                
                img.frame(width: w).frame(maxHeight: .infinity).clipped()
            }
        }
    }

    // MARK: - Logic Resolvers

    private func applyFlexFrame<V: View>(view: V, maxWidth: CGFloat?, maxHeight: CGFloat?, alignment: Alignment) -> some View {
        if maxWidth != nil || maxHeight != nil {
            return AnyView(view.frame(maxWidth: maxWidth, maxHeight: maxHeight, alignment: alignment))
        }
        return AnyView(view)
    }

    private func resolveOverride(for node: WidgetNode?) -> NodeOverride? {
        guard let id = node?.bindId else { return nil }
        return remoteData[id]
    }

    private func containerFixedWidth(_ node: WidgetNode) -> CGFloat? {
        if case .container(let c) = node { return c.width.map { CGFloat($0) } }
        if case .spacer(let s) = node { return s.width.map { CGFloat($0) } }
        return nil
    }

    private func containerFixedHeight(_ node: WidgetNode) -> CGFloat? {
        if case .container(let c) = node { return c.height.map { CGFloat($0) } }
        return nil
    }

    private func resolveAlignment(for node: WidgetNode, override: NodeOverride?) -> Alignment {
        let str: String?
        switch node {
        case .text(let n): str = override?.textAlignment ?? n.alignment ?? n.textAlignment
        case .image(let n): str = n.alignment
        case .container(let n): str = n.alignment
        case .spacer: str = nil
        }
        return alignmentValue(from: str)
    }

    private func nodeHidden(_ node: WidgetNode) -> Bool {
        if case .text(let n) = node { return n.hidden ?? false }
        if case .image(let n) = node { return n.hidden ?? false }
        return false
    }

    private func nodeOpacity(_ node: WidgetNode) -> Double {
        if case .text(let n) = node { return n.opacity ?? 1.0 }
        if case .image(let n) = node { return n.opacity ?? 1.0 }
        return 1.0
    }

    private func resolvedPadding(for node: ContainerNode) -> EdgeInsets {
        let b = CGFloat(node.padding ?? 0)
        return EdgeInsets(top: CGFloat(node.paddingTop ?? Double(b)),
                          leading: CGFloat(node.paddingStart ?? Double(b)),
                          bottom: CGFloat(node.paddingBottom ?? Double(b)),
                          trailing: CGFloat(node.paddingEnd ?? Double(b)))
    }

    private func alignmentValue(from str: String?) -> Alignment {
        switch str {
        case "topLeading", "topLeft": return .topLeading
        case "topCenter": return .top
        case "topTrailing", "topRight": return .topTrailing
        case "leading", "centerLeading", "centerLeft": return .leading
        case "center": return .center
        case "trailing", "centerTrailing", "centerRight": return .trailing
        case "bottomLeading", "bottomLeft": return .bottomLeading
        case "bottomCenter": return .bottom
        case "bottomTrailing", "bottomRight": return .bottomTrailing
        default: return .topLeading
        }
    }

    private func getTextAlignment(from str: String?) -> TextAlignment {
        str == "center" ? .center : (str == "trailing" ? .trailing : .leading)
    }

    private func fontWeightValue(_ weight: String) -> Font.Weight {
        switch weight {
        case "bold": return .bold
        case "semibold": return .semibold
        case "medium": return .medium
        case "light": return .light
        default: return .regular
        }
    }

    private func getLink(for node: WidgetNode) -> String? {
        if case .text(let n) = node { return n.link }
        if case .image(let n) = node { return n.link }
        if case .container(let n) = node { return n.link }
        return nil
    }

    struct DeepLinkModifier: ViewModifier {
        let link: String?
        func body(content: Content) -> some View {
            if let s = link, let url = URL(string: s) { Link(destination: url) { content } }
            else { content }
        }
    }
}

// MARK: - Hex Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&rgb)
        if hex.count == 8 {
            self.init(red: Double((rgb>>16)&0xFF)/255, green: Double((rgb>>8)&0xFF)/255, blue: Double(rgb&0xFF)/255, opacity: Double((rgb>>24)&0xFF)/255)
        } else {
            self.init(red: Double((rgb>>16)&0xFF)/255, green: Double((rgb>>8)&0xFF)/255, blue: Double(rgb&0xFF)/255)
        }
    }
}