import Foundation

struct NodeOverride: Decodable {
    let value: String?
    let color: String?
    let src: String?
    let backgroundColor: String?
    let link: String?
    let fontSize: Double?
    let fontWeight: String?
    let opacity: Double?
    let hidden: Bool?
    let width: Double?
    let height: Double?
    let textAlignment: String?
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
    let layout: String
    let backgroundColor: String?
    let children: [WidgetNode]
    let spacing: Double?
    let cornerRadius: Double?
    let padding: Double?
    let paddingTop: Double?
    let paddingBottom: Double?
    let paddingStart: Double?
    let paddingEnd: Double?
    let contentAlignment: String?
}

// MARK: - Widget Node
indirect enum WidgetNode: Decodable, Identifiable {
    case text(TextNode)
    case spacer(SpacerNode)
    case image(ImageNode)
    case container(ContainerNode)

    var id: UUID {
        switch self {
        case .text(let node):      return node.id
        case .spacer(let node):    return node.id
        case .image(let node):     return node.id
        case .container(let node): return node.id
        }
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        switch type {
        case "text":      self = .text(try TextNode(from: decoder))
        case "spacer":    self = .spacer(try SpacerNode(from: decoder))
        case "image":     self = .image(try ImageNode(from: decoder))
        case "container": self = .container(try ContainerNode(from: decoder))
        default:
            throw DecodingError.dataCorruptedError(forKey: .type, in: container,
                debugDescription: "Unsupported node type: \(type)")
        }
    }

    enum CodingKeys: String, CodingKey { case type }
}

// MARK: - Node Definitions

struct TextNode: Decodable, Identifiable {
    let id = UUID()
    let bindId: String?
    let value: String
    let fontSize: Double?
    let fontWeight: String?
    let color: String?
    let textAlignment: String?
    let alignment: String?
    let opacity: Double?
    let hidden: Bool?
    let link: String?

    private enum CodingKeys: String, CodingKey {
        case bindId = "id"
        case value, fontSize, fontWeight, color, textAlignment, alignment, opacity, hidden, link
    }
}

struct SpacerNode: Decodable, Identifiable {
    let id = UUID()
    let width: Double?

    private enum CodingKeys: String, CodingKey { case width }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        width = try c.decodeIfPresent(Double.self, forKey: .width)
    }

    init(width: Double? = nil) { self.width = width }
}

struct ImageNode: Decodable, Identifiable {
    let id = UUID()
    let bindId: String?
    let src: String
    let width: Double?
    let height: Double?
    let fillHeight: Bool?
    let contentMode: String?
    let isBackground: Bool?
    let alignment: String?
    let opacity: Double?
    let hidden: Bool?
    let link: String?

    private enum CodingKeys: String, CodingKey {
        case bindId = "id"
        case src, width, height, fillHeight, contentMode, isBackground, alignment, opacity, hidden, link
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
    let width: Double?
    let height: Double?
    let spacing: Double?
    let cornerRadius: Double?
    let padding: Double?
    let paddingTop: Double?
    let paddingBottom: Double?
    let paddingStart: Double?
    let paddingEnd: Double?
    let contentAlignment: String?

    private enum CodingKeys: String, CodingKey {
        case bindId = "id"
        case layout, backgroundColor, children, alignment, link
        case width, height, spacing, cornerRadius
        case padding, paddingTop, paddingBottom, paddingStart, paddingEnd
        case contentAlignment
    }
}

// MARK: - Helpers
extension WidgetNode {
    var bindId: String? {
        switch self {
        case .text(let n):      return n.bindId
        case .image(let n):     return n.bindId
        case .container(let n): return n.bindId
        case .spacer:           return nil
        }
    }

    var isBackground: Bool {
        if case .image(let node) = self { return node.isBackground == true }
        return false
    }
}