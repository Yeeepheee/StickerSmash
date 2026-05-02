import Foundation

struct NodeOverride: Decodable {
    let value: String?
    let color: String?
    let src: String?
    let backgroundColor: String?
    let link: String?
}

// MARK: - Root Config
struct MultiSizeWidgetConfig: Decodable {
    let small: WidgetSchema
    let medium: WidgetSchema?
    let large: WidgetSchema?
    let remoteConfigUrl: String?
}

// MARK: - Widget Schema
struct WidgetSchema: Decodable {
    let layout: String // "vstack", "hstack", "zstack"
    let backgroundColor: String?
    let children: [WidgetNode]
}

// MARK: - Widget Node
indirect enum WidgetNode: Decodable, Identifiable {
    case text(TextNode)
    case spacer(SpacerNode)
    case image(ImageNode)
    case container(ContainerNode)
    
    var id: UUID {
        switch self {
        case .text(let node): return node.id
        case .spacer(let node): return node.id
        case .image(let node): return node.id
        case .container(let node): return node.id
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
        case "container":
            self = .container(try ContainerNode(from: decoder))
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
    let bindId: String?
    let value: String
    let fontSize: Double?
    let color: String?
    let textAlignment: String?
    let alignment: String?
    let link: String?
    
    private enum CodingKeys: String, CodingKey {
        case bindId = "id", value, fontSize, color, textAlignment, alignment, link
    }
}

struct SpacerNode: Decodable, Identifiable {
    let id = UUID()
    
    init(from decoder: Decoder) throws { }
    
    init() { }
}

struct ImageNode: Decodable, Identifiable {
    let id = UUID()
    let bindId: String?
    let src: String
    let width: Double?
    let height: Double?
    let contentMode: String?
    let isBackground: Bool?
    let alignment: String?
    let link: String?
    
    private enum CodingKeys: String, CodingKey {
        case bindId = "id", src, width, height, contentMode, isBackground, alignment, link
    }
}

struct ContainerNode: Decodable, Identifiable {
    let id = UUID()
    let bindId: String? 
    let layout: String?
    let backgroundColor: String?
    let children: [WidgetNode]
    let alignment: String?
    let link: String?
    
    private enum CodingKeys: String, CodingKey {
        case bindId = "id", layout, backgroundColor, children, alignment, link
    }
}

// MARK: - Helpers
extension WidgetNode {
    var bindId: String? {
        switch self {
        case .text(let n): return n.bindId
        case .image(let n): return n.bindId
        case .container(let n): return n.bindId
        case .spacer: return nil
        }
    }
    
    var isBackground: Bool {
        if case .image(let node) = self { 
            return node.isBackground == true 
        }
        return false
    }
}