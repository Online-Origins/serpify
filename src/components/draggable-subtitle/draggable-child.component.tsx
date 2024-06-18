import { Draggable, Droppable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";
import DraggableBaby from "./draggable-baby.component";
import classNames from "classnames";

// Child element from draggable subtitle
export default function DraggableChild({
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
    <Draggable draggableId={title.id.toString()} index={index}>
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
          <Droppable droppableId={title.id.toString()} type="h4">
            {(provided, snapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className={classNames("dropPlace", snapshot.isDraggingOver && 'dropHover')}>
                {title.subtitles && title.subtitles.length> 0 ?
                  title.subtitles.map((subtitle: any, index: any) => (
                    <DraggableBaby
                      key={subtitle.id}
                      title={subtitle}
                      index={index}
                      grantParentId={title.id}
                      handleTitleChange={handleTitleChange}
                      setContentGeneratedOutlines={setContentGeneratedOutlines}
                      contentGeneratedOutlines={contentGeneratedOutlines}
                      language={language}
                    />
                  )) : ""}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}
