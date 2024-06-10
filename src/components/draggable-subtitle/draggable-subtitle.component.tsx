import { Draggable, Droppable } from "@hello-pangea/dnd";
import Subtitle from "../subtitle/subtitle.component";
import DraggableChild from "./draggable-child.component";
import classNames from "classnames";

export default function DraggableSubtitle({
  title,
  index,
  handleTitleChange,
  setContentGeneratedOutlines,
  contentGeneratedOutlines,
  language,
}: {
  title: any;
  index: any;
  handleTitleChange: any;
  setContentGeneratedOutlines: any;
  contentGeneratedOutlines: any;
  language: string;
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
          draggable
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
            language={language}
          />
          {title.subtitles && (
            <Droppable droppableId={title.id.toString()} type="h3">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={classNames("dropPlace", snapshot.isDraggingOver && 'dropHover')}
                >
                  {title.subtitles && title.subtitles.length > 0
                    ? title.subtitles.map((subtitle: any, index: any) => (
                        <DraggableChild
                          key={subtitle.id}
                          title={subtitle}
                          index={index}
                          grantParentId={title.id}
                          handleTitleChange={handleTitleChange}
                          setContentGeneratedOutlines={
                            setContentGeneratedOutlines
                          }
                          contentGeneratedOutlines={contentGeneratedOutlines}
                          language={language}
                        />
                      ))
                    : ""}
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
