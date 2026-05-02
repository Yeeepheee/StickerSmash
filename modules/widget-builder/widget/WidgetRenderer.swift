import SwiftUI

struct WidgetRenderer: View {
    @Environment(\.widgetContentMargins) var margins
    let schema: WidgetSchema
    let images: [String: Data]
    let remoteData: [String: NodeOverride] 
    var isRoot: Bool = false

    var body: some View {
        let backgroundNode = schema.children.first { $0.isBackground }
        let foregroundNodes = schema.children.filter { !$0.isBackground }
        let contentLayout = renderLayout(layout: schema.layout, children: foregroundNodes)
        
        Group {
            if isRoot {
                if #available(iOS 17.0, *) {
                    contentLayout
                        .padding(margins)
                        .containerBackground(for: .widget) { renderBackgroundLayer(node: backgroundNode) }
                } else {
                    contentLayout.padding(16).background(renderBackgroundLayer(node: backgroundNode))
                }
            } else {
                renderLayout(layout: schema.layout, children: schema.children)
                    .background(backgroundColorView(for: nil, defaultColor: schema.backgroundColor))
            }
        }
    }

    @ViewBuilder
    private func renderBackgroundLayer(node: WidgetNode?) -> some View {
        let bindId = node?.bindId
        let override = bindId != nil ? remoteData[bindId!] : nil
        
        ZStack {
            backgroundColorView(for: override, defaultColor: schema.backgroundColor)
            
            if let node = node, case .image(let imageNode) = node {
                let src = override?.src ?? imageNode.src
                if let imageData = images[src], let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage).resizable().scaledToFill()
                }
            }
        }
    }

    @ViewBuilder
    private func backgroundColorView(for override: NodeOverride?, defaultColor: String?) -> some View {
        let bgColor = override?.backgroundColor ?? defaultColor
        if let bgColor = bgColor, bgColor.lowercased() != "transparent" {
            Color(hex: bgColor)
        } else {
            Color.clear
        }
    }


    @ViewBuilder
    func renderLayout(layout: String, children: [WidgetNode]) -> some View {
        switch layout {
        case "hstack":
            HStack(alignment: .center, spacing: 0) {
                ForEach(children) { node in
                    renderNodeWithAlignment(node, inZStack: false)
                }
            }
        case "zstack":
            ZStack {
                ForEach(children) { node in
                    renderNodeWithAlignment(node, inZStack: true)
                }
            }
        default: // vstack
            VStack(alignment: .center, spacing: 0) {
                ForEach(children) { node in
                    renderNodeWithAlignment(node, inZStack: false)
                }
            }
        }
    }

    @ViewBuilder
    func renderNodeWithAlignment(_ node: WidgetNode, inZStack: Bool = false) -> some View {
        let bindId = node.bindId
        let override = bindId != nil ? remoteData[bindId!] : nil
        
        let align = getAlignment(for: node)
        let linkString = override?.link ?? getLink(for: node)

        Group {
            switch node {
            case .text(let textNode):
                let value = override?.value ?? textNode.value
                let color = override?.color ?? textNode.color ?? "#000000"
                
                Text(value)
                    .font(.system(size: textNode.fontSize ?? 16))
                    .foregroundColor(Color(hex: color))
                    .multilineTextAlignment(getTextAlignment(from: textNode.textAlignment))
            
            case .spacer(_):
                Spacer()
                
            case .image(let imageNode):
                let src = override?.src ?? imageNode.src
                if let imageData = images[src], let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(contentMode: imageNode.contentMode == "fill" ? .fill : .fit)
                        .frame(width: imageNode.width ?? 50, height: imageNode.height ?? 50)
                        .clipped()
                } else {
                    Color.gray.frame(width: 50, height: 50)
                }
                
            case .container(let containerNode):
                let childSchema = WidgetSchema(
                    layout: containerNode.layout ?? "vstack",
                    backgroundColor: override?.backgroundColor ?? containerNode.backgroundColor,
                    children: containerNode.children
                )
                WidgetRenderer(schema: childSchema, images: images, remoteData: remoteData, isRoot: false)
            }
        }
        .frame(
            maxWidth: (isFilling(node) || inZStack) ? .infinity : nil,
            maxHeight: (isFilling(node) || inZStack) ? .infinity : nil,
            alignment: align
        )
        .modifier(DeepLinkModifier(link: linkString))
    }

    // Helper Logic
    struct DeepLinkModifier: ViewModifier {
        let link: String?
        func body(content: Content) -> some View {
            if let linkStr = link, let url = URL(string: linkStr) {
                Link(destination: url) { content }
            } else {
                content
            }
        }
    }

    private func getLink(for node: WidgetNode) -> String? {
        switch node {
            case .text(let n): return n.link
            case .image(let n): return n.link
            case .container(let n): return n.link
            case .spacer: return nil
        }
    }

    private func isFilling(_ node: WidgetNode) -> Bool {
        switch node {
        case .spacer: return true
        case .container: return true
        default: return false
        }
    }

    private func getAlignment(for node: WidgetNode) -> Alignment {
        let alignStr: String?
        switch node {
        case .text(let n): alignStr = n.alignment
        case .image(let n): alignStr = n.alignment
        case .container(let n): alignStr = n.alignment
        case .spacer: alignStr = nil
        }
        
        switch alignStr {
        case "topLeading", "topLeft": return .topLeading
        case "topCenter": return .top
        case "topTrailing", "topRight": return .topTrailing
        case "centerLeading", "centerLeft": return .leading
        case "center": return .center
        case "centerTrailing", "centerRight": return .trailing
        case "bottomLeading", "bottomLeft": return .bottomLeading
        case "bottomCenter": return .bottom
        case "bottomTrailing", "bottomRight": return .bottomTrailing
        default: return .center
        }
    }

    private func getTextAlignment(from str: String?) -> TextAlignment {
        switch str {
        case "center": return .center
        case "trailing": return .trailing
        default: return .leading
        }
    }
}

// MARK: - Hex Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        let scanner = Scanner(string: hex)
        if hex.hasPrefix("#") {
            scanner.currentIndex = hex.index(after: hex.startIndex)
        }
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        
        // Handle both 6-digit (RGB) and 8-digit (ARGB)
        if hex.count == 9 { // #AARRGGBB
            let a = Double((rgb >> 24) & 0xFF) / 255.0
            let r = Double((rgb >> 16) & 0xFF) / 255.0
            let g = Double((rgb >> 8) & 0xFF) / 255.0
            let b = Double(rgb & 0xFF) / 255.0
            self.init(red: r, green: g, blue: b, opacity: a)
        } else { // #RRGGBB
            let r = Double((rgb >> 16) & 0xFF) / 255.0
            let g = Double((rgb >> 8) & 0xFF) / 255.0
            let b = Double(rgb & 0xFF) / 255.0
            self.init(red: r, green: g, blue: b)
        }
    }
}
