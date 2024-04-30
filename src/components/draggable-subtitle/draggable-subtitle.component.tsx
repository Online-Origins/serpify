import { Draggable, Droppable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";
import DraggableChild from "./draggable-child.component";

export default function DraggableSubtitle({
  title,
  index,
  handleTitleChange,
  setContentGeneratedOutlines,
  contentGeneratedOutlines,
}: {
  title: any;
  index: any;
  handleTitleChange: any;
  setContentGeneratedOutlines: any;
  contentGeneratedOutlines: any;
}) {
  return (
    <Draggable draggableId={title.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Subtitle
            key={title.id}
            title={title}
            onChange={(value: string, id: number) =>
              handleTitleChange(id, value)
            }
            removeTitle={(e: number) =>
              setContentGeneratedOutlines(
                contentGeneratedOutlines.filter((title: any) => title.id !== e)
              )
            }
          />
          {title.subtitles && (
            <Droppable droppableId={title.id.toString()} type="h2">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {title.subtitles.map((subtitle: any, index: any) => (
                    <DraggableChild
                      key={subtitle.id}
                      title={subtitle}
                      index={index}
                      grantParentId={title.id}
                      handleTitleChange={handleTitleChange}
                      setContentGeneratedOutlines={setContentGeneratedOutlines}
                      contentGeneratedOutlines={contentGeneratedOutlines}
                    />
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
