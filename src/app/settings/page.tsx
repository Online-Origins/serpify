"use client";
import InnerWrapper from "@/components/inner-wrapper/inner-wrapper.component";
import styles from "./page.module.scss";
import PageTitle from "@/components/page-title/page-title.component";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient/server";
import { useSharedContext } from "@/context/SharedContext";
import InputWrapper from "@/components/ui/input-wrapper/input-wrapper.component";
import languageCodes from "@/json/language-codes.json";
import Button from "@/components/ui/button/button.component";
import {
  AddOutlined,
  CloseRounded,
  DeleteOutline,
  SaveOutlined,
} from "@mui/icons-material";
import PopUpWrapper from "@/components/ui/popup-wrapper/popup-wrapper.component";
import PopUp from "@/components/ui/popup/popup.component";

export default function ProjectSettings() {
  const router = useRouter();
  const [domains, setDomains] = useState<any[]>([]);
  const [currentDomain, setCurrentDomain] = useState<any>();
  const { currentUrl, setCurrentUrl, setAvailableDomains, availableDomains } =
    useSharedContext();
  const [projectName, setProjectName] = useState("");
  const [projectDomain, setProjectDomain] = useState("");
  const [projectAudience, setProjectAudience] = useState("");
  const [projectLanguage, setProjectLanguage] = useState("");
  const [popUpOpen, setPopUpOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("");
  const [newProjectAudience, setNewProjectAudience] = useState("");
  const [newProjectLanguage, setNewProjectLanguage] = useState(
    languageCodes[0].id
  );

  useEffect(() => {
    getDomains();
  }, []);

  async function getDomains() {
    const { data } = await supabase.from("domains").select();
    if (data) {
      setDomains(data);
    }
  }

  useEffect(() => {
    if (currentUrl && domains.length > 0) {
      const currentDomainId = domains.find(
        (domain: any) => domain.domain == currentUrl
      );
      setCurrentDomain(currentDomainId);
      setProjectName(
        currentDomainId.projectName ? currentDomainId.projectName : ""
      );
      setProjectDomain(currentDomainId.domain ? currentDomainId.domain : "");
      setProjectAudience(
        currentDomainId.targetAudience ? currentDomainId.targetAudience : ""
      );
      setProjectLanguage(
        currentDomainId.language
          ? currentDomainId.language
          : languageCodes[0].id
      );
    }
  }, [currentUrl, domains]);

  async function saveDomain() {
    const { error } = await supabase
      .from("domains")
      .update({
        domain: projectDomain,
        projectName: projectName,
        targetAudience: projectAudience,
        language: projectLanguage,
      })
      .eq("id", currentDomain.id);
    if (error) {
        alert("Something went wrong. Please try again")
      return
    }
    getDomains();
  }

  async function deleteProject() {
    const { error } = await supabase
      .from("domains")
      .delete()
      .eq("id", currentDomain.id);
    if (!error) {
      setAvailableDomains(
        domains
          .sort((a: any, b: any) => a.id - b.id)
          .filter((domain: any) => domain.id != currentDomain.id)
          .map((domain: any) => domain.domain)
      );
      router.push("/");
    }
  }

  async function createProject() {
    const cleanedDomain = newProjectDomain.replace(
      /(https|http|www\.|:\/\/|\/)/g,
      ""
    );
    if (availableDomains.includes(cleanedDomain)) {
      alert("This project already exists");
      setPopUpOpen(false);
      return;
    }
    const inserting = await supabase.from("domains").insert([
      {
        domain: cleanedDomain,
        projectName: newProjectName,
        targetAudience: newProjectAudience,
        language: newProjectLanguage,
      },
    ]).select();
    if (inserting.error) {
      alert("Something went wrong. Please try again.");
      console.log(inserting.error);
      return;
    } else if (inserting.data) {
      setAvailableDomains(
        domains
          .concat(inserting.data[0])
          .sort((a: any, b: any) => a.id - b.id)
          .map((domain: any) => domain.domain)
      );
      router.push("/");
    }
  }

  return (
    <InnerWrapper className={styles.pageWrapper}>
      <PageTitle
        title={"Project management"}
        goBack={() => router.back()}
        buttons={[
          <Button key={0} type={"outline"} onClick={() => deleteProject()}>
            <p>Delete</p>
            <DeleteOutline />
          </Button>,
          <Button key={1} type={"solid"} onClick={() => setPopUpOpen(true)}>
            <p>Create project</p>
            <AddOutlined />
          </Button>,
        ]}
      />
      <div className={styles.fieldsWrapper}>
        <InputWrapper
          type="text"
          title="Project name:"
          onChange={(value: any) => setProjectName(value)}
          value={projectName}
          placeholder="What is the name of your project?"
        />
        <InputWrapper
          type="text"
          title="Website domain or URL path:"
          onChange={(value: any) => setProjectDomain(value)}
          value={projectDomain}
          placeholder="What is the website of your project?"
        />
        <InputWrapper
          type="text"
          title="Target audience:"
          onChange={(value: any) => setProjectAudience(value)}
          value={projectAudience}
          placeholder="Who do you want to target with your project?"
        />
        <InputWrapper
          type="autocomplete"
          title="Language:"
          required={false}
          options={languageCodes}
          value={projectLanguage}
          onChange={(value: any) =>
            setProjectLanguage(value != null ? value : languageCodes[0].id)
          }
          placeholder="In what language is your project?"
        />
        <Button
          type={"solid"}
          onClick={() => saveDomain()}
          disabled={
            currentDomain &&
            (!projectName ||
              !projectDomain ||
              !projectAudience ||
              !projectLanguage ||
              (projectName ===
                (currentDomain.projectName ? currentDomain.projectName : "") &&
                projectDomain ===
                  (currentDomain.domain ? currentDomain.domain : "") &&
                projectAudience ===
                  (currentDomain.targetAudience
                    ? currentDomain.targetAudience
                    : "") &&
                projectLanguage ===
                  (currentDomain.language
                    ? currentDomain.language
                    : languageCodes[0].id)))
          }
        >
          <p>Save</p>
          <SaveOutlined />
        </Button>
      </div>
      {popUpOpen && (
        <PopUpWrapper>
          <PopUp
            title={"Create new project"}
            titleButtons={
              <Button type={"textOnly"} onClick={() => setPopUpOpen(false)}>
                <p>Close</p>
                <CloseRounded />
              </Button>
            }
            buttons={
              <Button
                type={"solid"}
                onClick={() => createProject()}
                disabled={
                  !newProjectName ||
                  !newProjectDomain ||
                  !newProjectLanguage
                }
              >
                <p>Save</p>
                <SaveOutlined />
              </Button>
            }
          >
            <InputWrapper
              type="text"
              title="Project name:"
              onChange={(value: any) => setNewProjectName(value)}
              value={newProjectName}
              placeholder="What is the name of your project?"
            />
            <InputWrapper
              type="text"
              title="Website domain or URL path:"
              onChange={(value: any) => setNewProjectDomain(value)}
              value={newProjectDomain}
              placeholder="What is the website of your project?"
            />
            <InputWrapper
              type="text"
              title="Target audience:"
              onChange={(value: any) => setNewProjectAudience(value)}
              value={newProjectAudience}
              placeholder="Who do you want to target with your project?"
            />
            <InputWrapper
              type="autocomplete"
              title="Language:"
              required={false}
              options={languageCodes}
              value={newProjectLanguage}
              onChange={(value: any) =>
                setNewProjectLanguage(
                  value != null ? value : languageCodes[0].id
                )
              }
              placeholder="In what language is your project?"
            />
          </PopUp>
        </PopUpWrapper>
      )}
    </InnerWrapper>
  );
}
