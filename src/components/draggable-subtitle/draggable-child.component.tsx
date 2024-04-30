import { Draggable, Droppable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";

export default function DraggableChild({
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
    <Draggable draggableId={title.id.toString()} index={index}>
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
                  if (grandParent.id == grantParentId) {
                    const updatedSubtitles = grandParent.subtitles.filter(
                      (subtitle: any) => subtitle.id !== e
                    );
                    return { ...grandParent, subtitles: updatedSubtitles };
                  }
                  return grandParent;
                })
              )
            }
          />
          {title.subtitles && (
            <Droppable droppableId={title.id.toString()} type="h3">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {title.subtitles.map((subtitle: any, index: any) => (
                    <Draggable
                      key={index}
                      draggableId={subtitle.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <Subtitle
                            key={subtitle.id}
                            title={subtitle}
                            onChange={(value: string, id: number) =>
                              handleTitleChange(id, value)
                            }
                            removeTitle={(e: number) =>
                                setContentGeneratedOutlines(
                                    contentGeneratedOutlines.map((grandParent: any) => {
                                      const updatedSubtitles = grandParent.subtitles.map((parent: any) => {
                                        if (parent.id == title.id) {
                                          const updatedSubtitles = parent.subtitles.filter(
                                            (subtitle: any) => subtitle.id !== e
                                          );
                                          return { ...parent, subtitles: updatedSubtitles };
                                        }
                                        return parent;
                                      });
                                      return { ...grandParent, subtitles: updatedSubtitles };
                                    })
                                  )
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );
}
