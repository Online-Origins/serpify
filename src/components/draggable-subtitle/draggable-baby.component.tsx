import { Draggable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";

// Child element from draggable child, which is a child of draggable subtitle
export default function DraggableBaby({
  title,
  index,
  handleTitleChange,
  setContentGeneratedOutlines,
  contentGeneratedOutlines,
  grantParentId,
  language,
}: {
  title: any;
  index: any;
  handleTitleChange: any;
  setContentGeneratedOutlines: any;
  contentGeneratedOutlines: any;
  grantParentId: any;
  language: string;
}) {
  return (
    <Draggable key={index} draggableId={title.id.toString()} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Subtitle
            draggable
            key={title.id}
            title={title}
            onChange={(value: string, id: number) =>
              handleTitleChange(id, value)
            }
            language={language}
            removeTitle={(e: number) =>
              setContentGeneratedOutlines(
                contentGeneratedOutlines.map((grandParent: any) => {
                  const updatedSubtitles = grandParent.subtitles.map(
                    (parent: any) => {
                      if (parent.id == grantParentId) {
                        const updatedSubtitles = parent.subtitles.filter(
                          (subtitle: any) => subtitle.id !== e
                        );
                        return { ...parent, subtitles: updatedSubtitles };
                      }
                      return parent;
                    }
                  );
                  return { ...grandParent, subtitles: updatedSubtitles };
                })
              )
            }
          />
        </div>
      )}
    </Draggable>
  );
}
