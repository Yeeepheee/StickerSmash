import Foundation
import SwiftUI

// MARK: - Widget Schema (Root)
struct WidgetSchema: Decodable {
    let layout: LayoutType
    let backgroundColor: String?
    let children: [WidgetNode]
}

// MARK: - Layout Types
enum LayoutType: String, Decodable {
    case vstack
    case hstack
}

// MARK: - Widget Node
enum WidgetNode: Decodable, Identifiable {
    case text(TextNode)
    case spacer(SpacerNode)
    
    var id: UUID {
        switch self {
        case .text(let node):
            return node.id
        case .spacer(let node):
            return node.id
        }
    }
    
    // Custom decoding
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        
        switch type {
        case "text":
            let node = try TextNode(from: decoder)
            self = .text(node)
        case "spacer":
            let node = try SpacerNode(from: decoder)
            self = .spacer(node)
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

// MARK: - Text Node
struct TextNode: Decodable, Identifiable {
    let id = UUID()
    let type: String
    let value: String
    let fontSize: Double
    let color: String
    let alignment: String
}

// MARK: - Spacer Node
struct SpacerNode: Decodable, Identifiable {
    let id = UUID()
    let type: String
}
