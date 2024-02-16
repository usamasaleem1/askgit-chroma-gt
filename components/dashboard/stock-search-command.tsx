"use client"

import * as React from "react"

import {
  CalendarIcon,
  EnvelopeClosedIcon,
  FaceIcon,
  GearIcon,
  PersonIcon,
  RocketIcon,
} from "@radix-ui/react-icons"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
// import { navigate } from '@/lib/actions'
import { useRouter } from 'next/navigation'

const filterCompanies = (value, search) => {
  console.log("filterCompanies", value, search);
  if (value.includes(search)) return 1;
  return 0;
};


type CompanyTypeProps = {
  tickr: string,
  name: string;
  altNames: string[]
};

export function CompanySearchCommand({ allCompanies }) {
  const router = useRouter()

  const [filteredCompanies, setFilteredCompanies] = React.useState<CompanyTypeProps[]>([])


  const arraySearch = (array, keyword) => {
    const searchTerm = keyword.toLowerCase()
    return array.filter(value => {
      return value.name.toLowerCase().match(new RegExp(searchTerm, 'g'))
    })
  }


  const inputChange = (search) => {

    // empty search box
    if (!search) {
      setFilteredCompanies([]);
      return;
    }
    setFilteredCompanies(arraySearch(allCompanies, search));
  }

  const itemSelected = (value) => {
    console.log("itemSelected", value);
    // get ticker from fitlered companies
    const selectedCompany = filteredCompanies.find(c => c.tickr.toLowerCase() === value);
    console.log("filtered", filteredCompanies, selectedCompany);
    if (selectedCompany?.tickr) {
      console.log("redirect to", selectedCompany?.tickr)
      // await navigate(`/dashboard/stock/${selectedCompany.tickr}`);
      router.push(`/dashboard/stock/${selectedCompany.tickr}`)
    } else {
      console.log("Unable to select company!!"); // TODO - handle this case
    }
  }

  const SubItem = (props) => {
    const search = "todo";
    // const search = useCommandState((state) => state.search)
    if (!search) return null
    return <CommandItem {...props} />
  }
  return (
    <Command className="rounded-lg border shadow-md" shouldFilter={false} filter={filterCompanies}>
      <CommandInput placeholder="Search company with name" onValueChange={inputChange} />
      <CommandList>
        <CommandEmpty>No companies found.</CommandEmpty>
        <CommandGroup>
          {filteredCompanies.map((item) => {
            return (
              <CommandItem key={item.tickr} value={item.tickr} onSelect={itemSelected}>
                <span>{item.name}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
