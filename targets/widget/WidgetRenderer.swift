import SwiftUI

struct WidgetRenderer: View {
    let schema: WidgetSchema

    var body: some View {
        ZStack {
            Color(hex: schema.backgroundColor ?? "#ffffff")
            
            if schema.layout == .vstack {
                VStack {
                    ForEach(schema.children) { node in
                        renderNode(node)
                    }
                }
                .padding(8)
            } else {
                HStack {
                    ForEach(schema.children) { node in
                        renderNode(node)
                    }
                }
                .padding(8)
            }
        }
    }

    @ViewBuilder
    func renderNode(_ node: WidgetNode) -> some View {
        switch node {
        case .text(let textNode):
            Text(textNode.value)
                .font(.system(size: textNode.fontSize))
                .foregroundColor(Color(hex: textNode.color))
                .frame(maxWidth: .infinity,
                       alignment: alignment(from: textNode.alignment))
        case .spacer(_):
            Spacer()
        }
    }
    
    // Map string alignment to SwiftUI alignment
    func alignment(from str: String) -> Alignment {
        switch str {
        case "leading": return .leading
        case "trailing": return .trailing
        default: return .center
        }
    }
}

// MARK: - Hex color support
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        let scanner = Scanner(string: hex)
        if hex.hasPrefix("#") {
            scanner.currentIndex = hex.index(after: hex.startIndex)
        }
        var rgb: UInt64 = 0
        scanner.scanHexInt64(&rgb)
        
        let r = Double((rgb >> 16) & 0xFF) / 255.0
        let g = Double((rgb >> 8) & 0xFF) / 255.0
        let b = Double(rgb & 0xFF) / 255.0
        
        self.init(red: r, green: g, blue: b)
    }
}
