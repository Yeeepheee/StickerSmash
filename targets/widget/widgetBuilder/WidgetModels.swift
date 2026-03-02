import Foundation
import SwiftUI

// MARK: - Widget Schema (Root)
struct WidgetSchema: Decodable {
    let layout: LayoutType
    let backgroundColor: String?
    let children: [WidgetNode]
}

enum LayoutType: String, Decodable {
    case vstack
    case hstack
}

// MARK: - Widget Node
enum WidgetNode: Decodable, Identifiable {
    case text(TextNode)
    case spacer(SpacerNode)
    case image(ImageNode) // Added Image case
    
    var id: UUID {
        switch self {
        case .text(let node): return node.id
        case .spacer(let node): return node.id
        case .image(let node): return node.id
        }
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        
        switch type {
        case "text":
            self = .text(try TextNode(from: decoder))
        case "spacer":
            self = .spacer(try SpacerNode(from: decoder))
        case "image":
            self = .image(try ImageNode(from: decoder))
        default:
            throw DecodingError.dataCorruptedError(
                forKey: .type,
                in: container,
                debugDescription: "Unsupported node type: \(type)"
            )
        }
    }
    
    enum CodingKeys: String, CodingKey {
        case type
    }
}

// MARK: - Node Definitions
struct TextNode: Decodable, Identifiable {
    let id = UUID()
    let value: String
    let fontSize: Double
    let color: String
    let alignment: String
}

struct SpacerNode: Decodable, Identifiable {
    let id = UUID()
}

// Added ImageNode to match widgetCompiler.tsx output
struct ImageNode: Decodable, Identifiable {
    let id = UUID()
    let src: String
    let width: Double
    let height: Double
}