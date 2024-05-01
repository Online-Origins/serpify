import { Draggable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";

export default function DraggableBaby({
  title,
  index,
  handleTitleChange,
  setContentGeneratedOutlines,
  contentGeneratedOutlines,
  grantParentId,
}: {
  title: any;
  index: any;
  handleTitleChange: any;
  setContentGeneratedOutlines: any;
  contentGeneratedOutlines: any;
  grantParentId: any;
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
            key={title.id}
            title={title}
            onChange={(value: string, id: number) =>
              handleTitleChange(id, value)
            }
            removeTitle={(e: number) =>
              setContentGeneratedOutlines(
                contentGeneratedOutlines.map((grandParent: any) => {
                  const updatedSubtitles = grandParent.subtitles.map(
                    (parent: any) => {
                      if (parent.id == title.id) {
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
